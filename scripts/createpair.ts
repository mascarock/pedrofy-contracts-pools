import { Address, toNano } from '@ton/core';
import { LiquidityPool } from '../wrappers/FactoryContract'; // Importa tu wrapper de Factory
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    
    // 1. Obtener la dirección del Factory Contract desplegado
    const factoryAddress = Address.parse(args.length > 0 ? args[0] : await ui.input('Factory address'));
    
    if (!(await provider.isContractDeployed(factoryAddress))) {
        ui.write(`Error: El Factory Contract en la dirección ${factoryAddress} no está desplegado!`);
        return;
    }
    
    // 2. Abrir el contrato Factory ya desplegado
    const factory = provider.open(LiquidityPool.createFromAddress(factoryAddress));
    
    // 3. Obtener las direcciones de los tokens para crear el par
    const token0Address = Address.parse(args.length > 1 ? args[1] : await ui.input('Dirección del Token 0'));
    const token1Address = Address.parse(args.length > 2 ? args[2] : await ui.input('Dirección del Token 1'));
    
    // 4. Verificar si el par ya existe
    ui.write('Verificando si el par ya existe...');
    try {
        const existingPair = await factory.getPairAddress(token0Address, token1Address);
        
        if (existingPair) {
            ui.write(`El par ya existe en la dirección: ${existingPair.toString()}`);
            return;
        }
    } catch (error) {
        ui.write('Error al verificar si el par existe:');
    }
    
    // 5. Crear un nuevo par con suficiente TON para cubrir los gastos
    ui.write(`Creando nuevo par para tokens: ${token0Address.toString()} y ${token1Address.toString()}...`);
    
    try {
        await factory.sendCreatePair(provider.sender(), {
            token0: token0Address,
            token1: token1Address,
            value: toNano('0.5'), // Aumentamos a 0.8 TON para cubrir gastos
            queryID: Math.floor(Date.now() / 1000), // ID único para la transacción
        });
        
        ui.write('Solicitud para crear el par enviada. Esperando confirmación...');
        
        // 6. Esperar a que se cree el par (polling)
        let pairAddress = null;
        let attempt = 1;
        const maxAttempts = 12;
        
        while (!pairAddress && attempt <= maxAttempts) {
            ui.setActionPrompt(`Verificando creación del par (intento ${attempt}/${maxAttempts})`);
            await sleep(5000); // Esperamos 5 segundos entre cada intento
            
            // Verificar si el par se ha creado
            try {
                pairAddress = await factory.getPairAddress(token0Address, token1Address);
            } catch (error) {
                ui.write(`Error en intento ${attempt}`);
            }
            
            attempt++;
        }
        
        ui.clearActionPrompt();
        
        if (pairAddress) {
            ui.write(`¡Par creado exitosamente!`);
            ui.write(`Dirección del par de liquidez: ${pairAddress.toString()}`);
            
            // 7. Mostrar información del par
            const totalPairs = await factory.getTotalPairs();
            const defaultFee = await factory.getDefaultFee();
            
            ui.write(`Información del Factory:`);
            ui.write(`- Total de pares creados: ${totalPairs}`);
            ui.write(`- Comisión predeterminada: ${defaultFee / 100}%`);
        } else {
            ui.write(`Error: No se pudo confirmar la creación del par después de ${maxAttempts} intentos.`);
            ui.write('Posibles motivos del error:');
            ui.write('1. Insuficiente TON para cubrir los gastos.');
            ui.write('2. Direcciones de tokens inválidas.');
            ui.write('3. Error interno en el contrato de Factory.');
            ui.write('4. Problema con la red TON.');
        }
    } catch (error) {
        ui.write('Error al enviar la transacción para crear el par:');
    }
}