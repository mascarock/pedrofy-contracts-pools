import { 
    Address, 
    beginCell, 
    Cell, 
    Contract, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    SendMode,
    Dictionary
} from '@ton/core';

// Operaciones del PairContract
export const PairOpcodes = {
    addLiquidity: 0x234c7bef,     // op::add_liquidity
    removeLiquidity: 0x5edc1170,  // op::remove_liquidity
    swap: 0x107c51ee,             // op::swap
    transfer: 0x7362d09c          // op::transfer
};

// Configuración del Par
export type PairConfig = {
    token0Address: Address;
    token1Address: Address;
    factoryAddress: Address;
    fee: number;
};

// Convierte la configuración del Par a una celda
export function pairConfigToCell(cfg: PairConfig): Cell {
    // Convertimos las Address a números de 256 bits (uint256)
    const token0AddrHash = BigInt('0x' + cfg.token0Address.hash.toString('hex'));
    const token1AddrHash = BigInt('0x' + cfg.token1Address.hash.toString('hex'));
    const factoryAddrHash = BigInt('0x' + cfg.factoryAddress.hash.toString('hex'));
    
    // 1️⃣  Hija con datos voluminosos / mutables
    const dataCell = beginCell()
        .storeUint(0, 128)                 // reserve0
        .storeUint(0, 128)                 // reserve1
        .storeUint(0, 128)                 // total_supply
        .storeDict(Dictionary.empty())     // lp_balances
        .endCell();

    // 2️⃣  Raíz con config mínima - ajustado para coincidir con el FunC
    return beginCell()
        .storeUint(token0AddrHash, 256)    // token0_address como uint256
        .storeUint(token1AddrHash, 256)    // token1_address como uint256
        .storeUint(factoryAddrHash, 256)   // factory_address como uint256
        .storeUint(cfg.fee, 16)            // fee como uint16
        .storeRef(dataCell)                // ref a datos variables
        .endCell();
}

export class PairContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new PairContract(address);
    }

    static createFromConfig(config: PairConfig, code: Cell, workchain = 0) {
        const data = pairConfigToCell(config);
        const init = { code, data };
        return new PairContract(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    // Método para añadir liquidez
    async sendAddLiquidity(
        provider: ContractProvider,
        via: Sender,
        opts: {
            amount0: bigint;
            amount1: bigint;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(PairOpcodes.addLiquidity, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.amount0, 128)
                .storeUint(opts.amount1, 128)
                .endCell(),
        });
    }

    // Método para remover liquidez
    async sendRemoveLiquidity(
        provider: ContractProvider,
        via: Sender,
        opts: {
            lpAmount: bigint;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(PairOpcodes.removeLiquidity, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.lpAmount, 128)
                .endCell(),
        });
    }

    // Método para hacer swap
    async sendSwap(
        provider: ContractProvider,
        via: Sender,
        opts: {
            isToken0ToToken1: boolean;
            inputAmount: bigint;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(PairOpcodes.swap, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.isToken0ToToken1 ? 1 : 0, 1)
                .storeUint(opts.inputAmount, 128)
                .endCell(),
        });
    }

    // Método para transferir tokens LP
    async sendTransfer(
        provider: ContractProvider,
        via: Sender,
        opts: {
            recipientAddress: Address;
            amount: bigint;
            value: bigint;
            queryID?: number;
        }
    ) {
        // Convertimos la Address a un número de 256 bits (uint256)
        const recipientAddrHash = BigInt('0x' + opts.recipientAddress.hash.toString('hex'));

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(PairOpcodes.transfer, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(recipientAddrHash, 256)  // Almacenamos como uint256 para coincidir con el FunC
                .storeUint(opts.amount, 128)
                .endCell(),
        });
    }

    // Getters
    async getReserves(provider: ContractProvider): Promise<{ reserve0: bigint; reserve1: bigint }> {
        const result = await provider.get('get_reserves', []);
        const reserve0 = result.stack.readBigNumber();
        const reserve1 = result.stack.readBigNumber();
        return { reserve0, reserve1 };
    }

    async getTokens(provider: ContractProvider): Promise<{ token0: Address; token1: Address }> {
        const result = await provider.get('get_tokens', []);
        const token0Int = result.stack.readBigNumber();
        const token1Int = result.stack.readBigNumber();
        
        const token0 = new Address(0, Buffer.from(token0Int.toString(16).padStart(64, '0'), 'hex'));
        const token1 = new Address(0, Buffer.from(token1Int.toString(16).padStart(64, '0'), 'hex'));
        
        return { token0, token1 };
    }

    async getLpSupply(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('get_lp_supply', []);
        return result.stack.readBigNumber();
    }

    async getLpBalanceOf(provider: ContractProvider, address: Address): Promise<bigint> {
        // Convertimos la Address a un número de 256 bits (uint256)
        const addrHash = BigInt('0x' + address.hash.toString('hex'));

        const result = await provider.get('get_lp_balance_of', [
            { type: 'int', value: addrHash }  // Pasamos como entero en lugar de slice
        ]);
        return result.stack.readBigNumber();
    }

    async getSwapAmount(
        provider: ContractProvider, 
        inputAmount: bigint, 
        isToken0ToToken1: boolean
    ): Promise<bigint> {
        const result = await provider.get('get_swap_amount', [
            { type: 'int', value: inputAmount },
            { type: 'int', value: BigInt(isToken0ToToken1 ? 1 : 0) }
        ]);
        return result.stack.readBigNumber();
    }
}