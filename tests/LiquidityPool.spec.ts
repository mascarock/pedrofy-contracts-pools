import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, Address } from '@ton/core';
import { LiquidityPool, FactoryConfig } from '../wrappers/FactoryContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('LiquidityPool', () => {
    let code: Cell;
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let liquidityPool: SandboxContract<LiquidityPool>;

    beforeAll(async () => {
        code = await compile('FactoryContract');
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        const config: FactoryConfig = {
            owner: deployer.address,
            pairCode: Cell.EMPTY, // This should be the actual pair contract code
            defaultFee: 30, // 0.3%
            feeCollector: deployer.address
        };

        liquidityPool = blockchain.openContract(
            LiquidityPool.createFromConfig(config, code)
        );

        const deployResult = await liquidityPool.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: liquidityPool.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // Verify initial state
        const owner = await liquidityPool.getOwner();
        expect(owner.toString()).toBe(deployer.address.toString());

        const defaultFee = await liquidityPool.getDefaultFee();
        expect(defaultFee).toBe(30);

        const feeCollector = await liquidityPool.getFeeCollector();
        expect(feeCollector.toString()).toBe(deployer.address.toString());

        const totalPairs = await liquidityPool.getTotalPairs();
        expect(totalPairs).toBe(0);
    });

    it('should create a new pair', async () => {
        const token0 = await blockchain.treasury('token0');
        const token1 = await blockchain.treasury('token1');

        const createPairResult = await liquidityPool.sendCreatePair(deployer.getSender(), {
            token0: token0.address,
            token1: token1.address,
            value: toNano('0.05')
        });

        expect(createPairResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: liquidityPool.address,
            success: true,
        });

        const pairAddress = await liquidityPool.getPairAddress(token0.address, token1.address);
        expect(pairAddress).not.toBeNull();

        const totalPairs = await liquidityPool.getTotalPairs();
        expect(totalPairs).toBe(1);
    });
});
