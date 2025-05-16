import { toNano, Address } from '@ton/core';
import { PairContract } from '../wrappers/PairContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    // Esta función muestra cómo desplegar directamente un PairContract
    // NOTA: Normalmente, esto NO debería hacerse directamente, ya que los pares
    // deben ser creados por el Factory para mantener el registro adecuado.
    // Este script es solo para pruebas o situaciones especiales.
    
    // Direcciones para la configuración del par
    const token0Address = Address.parse('kQCGZDHS_ViaUVjS9DxWDs5OSiyzzZ6xyQcqZFCQvpDartzX');
    const token1Address = Address.parse('kQDnRHbK5vJBLQyAnS6V8XNoRerCebnn9A2FlVlHtFVLFN30');
    const factoryAddress = Address.parse('kQCcJtkWr8vdnzv0fezoRXQxvwAQSqJC6P5cqYSEfDaVfqF2');
    
    // Configuramos el PairContract
    const pairContract = provider.open(
        PairContract.createFromConfig(
            {
                token0Address: token0Address,
                token1Address: token1Address,
                factoryAddress: factoryAddress,
                fee: 30 // 0.3% fee (30 basis points)
            },
            await compile('PairContract')
        )
    );
    
    // Desplegamos el contrato con suficiente TON para cubrir gastos
    await pairContract.sendDeploy(provider.sender(), toNano('0.5'));
    
    // Esperamos a que se complete el despliegue
    await provider.waitForDeploy(pairContract.address);
    
    // Mostramos información útil después del despliegue
    console.log('PairContract desplegado en:', pairContract.address.toString());
    
    // Mostramos información del par desplegado
    const tokens = await pairContract.getTokens();
    console.log('Token0:', tokens.token0.toString());
    console.log('Token1:', tokens.token1.toString());
    
    const reserves = await pairContract.getReserves();
    console.log('Reservas iniciales:', {
        reserve0: reserves.reserve0.toString(),
        reserve1: reserves.reserve1.toString()
    });
    
    const lpSupply = await pairContract.getLpSupply();
    console.log('Supply inicial de LP tokens:', lpSupply.toString());
    
    // Advertencia sobre el despliegue directo
    console.log('\n⚠️ ADVERTENCIA:');
    console.log('Este par ha sido desplegado directamente sin pasar por el Factory.');
    console.log('Esto podría causar problemas de compatibilidad si el Factory espera');
    console.log('que todos los pares estén registrados en su diccionario interno.');
}