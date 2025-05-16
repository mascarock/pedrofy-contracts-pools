import { toNano, Address } from '@ton/core';
import { LiquidityPool } from '../wrappers/FactoryContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    
    // Compilar el código del contrato de par de liquidez (esto es para el pairCode)
    ui.write('Compilando el código del par de liquidez...');
    const pairCode = await compile('PairContract');
    
    // Compilar el código del factory
    ui.write('Compilando el código del factory...');
    const factoryCode = await compile('FactoryContract');
    
    // Configuramos el LiquidityPool (Factory)
    const liquidityPool = provider.open(
        LiquidityPool.createFromConfig(
            {
                owner: provider.sender().address!, // El propietario será quien despliegue el contrato
                pairCode: pairCode, // El código compilado para los pares de liquidez
                defaultFee: 30, // Fee por defecto: 0.3% (30 basis points)
                feeCollector: provider.sender().address!, // El colector de fees será quien despliegue
            },
            factoryCode
        )
    );

    // Desplegamos el contrato con suficiente TON para cubrir gastos
    ui.write(`Desplegando LiquidityPool en: ${liquidityPool.address.toString()}`);
    await liquidityPool.sendDeploy(provider.sender(), toNano('0.5'));

    // Esperamos a que se complete el despliegue
    ui.write('Esperando a que se complete el despliegue...');
    await provider.waitForDeploy(liquidityPool.address);

    // Mostramos información útil después del despliegue
    ui.write('LiquidityPool desplegado exitosamente!');
    ui.write('Dirección: ' + liquidityPool.address.toString());
    
    // Mostramos información adicional sobre el factory desplegado
    try {
        const owner = await liquidityPool.getOwner();
        const fee = await liquidityPool.getDefaultFee();
        const collector = await liquidityPool.getFeeCollector();
        const totalPairs = await liquidityPool.getTotalPairs();
        
        ui.write('Propietario: ' + owner.toString());
        ui.write('Fee predeterminada: ' + fee / 100 + '%');
        ui.write('Collector de fees: ' + collector.toString());
        ui.write('Total de pares: ' + totalPairs);
    } catch (error) {
        ui.write('Error al obtener la información del contrato:');
    }
}