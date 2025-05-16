import { 
    Address, 
    beginCell, 
    Cell, 
    Contract, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    SendMode,
    Dictionary,
} from '@ton/core';

// Operaciones del Factory
export const FactoryOpcodes = {
    createPair: 0x12a2d48c, // op::create_pair
    setFee: 0x637f0d2b,    // op::set_fee
    collectFee: 0x5dbd0308  // op::collect_fee
};

// Configuración del Factory
export type FactoryConfig = {
    owner: Address;
    pairCode: Cell;
    defaultFee: number;
    feeCollector: Address;
};

// Convierte la configuración del Factory a una celda
export function factoryConfigToCell(config: FactoryConfig): Cell {
    // Creamos un diccionario vacío para los pares
    const pairsDict = Dictionary.empty();
    const pairsCell = beginCell().storeDict(pairsDict).endCell();
    
    return beginCell()
        .storeAddress(config.owner)
        .storeRef(config.pairCode)
        .storeUint(config.defaultFee, 16)
        .storeAddress(config.feeCollector)
        .storeUint(0, 32) // Total pairs inicialmente es 0
        .storeRef(pairsCell)
        .endCell();
}

export class LiquidityPool implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new LiquidityPool(address);
    }

    static createFromConfig(config: FactoryConfig, code: Cell, workchain = 0) {
        const data = factoryConfigToCell(config);
        const init = { code, data };
        return new LiquidityPool(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    // Método para crear un nuevo par de liquidez
    async sendCreatePair(
        provider: ContractProvider,
        via: Sender,
        opts: {
            token0: Address;
            token1: Address;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(FactoryOpcodes.createPair, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeAddress(opts.token0)
                .storeAddress(opts.token1)
                .endCell(),
        });
    }

    // Método para cambiar la comisión predeterminada
    async sendSetFee(
        provider: ContractProvider,
        via: Sender,
        opts: {
            newFee: number;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(FactoryOpcodes.setFee, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.newFee, 16)
                .endCell(),
        });
    }

    // Método para recolectar comisiones
    async sendCollectFee(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(FactoryOpcodes.collectFee, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .endCell(),
        });
    }

    // Getters
    async getPairAddress(provider: ContractProvider, token0: Address, token1: Address): Promise<Address | null> {
        const result = await provider.get('get_pair_address', [
            { type: 'slice', cell: beginCell().storeAddress(token0).endCell() },
            { type: 'slice', cell: beginCell().storeAddress(token1).endCell() }
        ]);
        
        const addressSlice = result.stack.readCellOpt();
        if (addressSlice === null) {
            return null;
        }
        
        return addressSlice.beginParse().loadAddress();
    }

    async getTotalPairs(provider: ContractProvider): Promise<number> {
        const result = await provider.get('get_total_pairs', []);
        return result.stack.readNumber();
    }

    async getDefaultFee(provider: ContractProvider): Promise<number> {
        const result = await provider.get('get_default_fee', []);
        return result.stack.readNumber();
    }

    async getOwner(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('get_owner', []);
        const ownerSlice = result.stack.readCell();
        return ownerSlice.beginParse().loadAddress();
    }

    async getFeeCollector(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('get_fee_collector', []);
        const collectorSlice = result.stack.readCell();
        return collectorSlice.beginParse().loadAddress();
    }
}