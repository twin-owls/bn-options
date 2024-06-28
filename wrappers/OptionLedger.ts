import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode, Slice, toNano, Tuple, TupleItem } from '@ton/core';
import { AnySoaRecord } from 'dns';

export type OptionLedgerConfig = {
    id: number,
    option_ledger_id: number,
    admin_address: Address,
    fee_collector: Address,
    users: Dictionary<number, UserDetails>,
    awaitingUsers: Dictionary<number, UserDetails>,
};

export type UserDetails = {
    option_type: number,
    option_amount: number,
}

export function optionLedgerConfigToCell(config: OptionLedgerConfig): Cell {
    return beginCell()
        .storeUint(config.id, 32)
        .storeUint(config.option_ledger_id, 256)
        .storeAddress(config.admin_address)
        .storeAddress(config.fee_collector)
        .storeDict(config.users)
        .storeDict(config.awaitingUsers)
        .endCell();
}

export const Opcodes = {
    placeCallOrder: 100,
    placePutOrder: 101,
    processOptionLedger: 102,
    startOptionLedger: 103,
};

export const exitCodes = {
    Successful: 0,
    InvalidMsg: 401,
    InvalidAddress: 402,
    InvalidOptionLedger: 403,
    InvalidProcessOrderID: 404,
    OptionLedgerNotStarted: 405,
    OptionAlreadyExist: 406,
    InvalidAdmin: 407,
    NotEnoughTON: 408,
    EmptyLedger: 409,
    InvalidOpCode: 0xffff,
}

export class OptionLedger implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new OptionLedger(address);
    }

    static createFromConfig(config: OptionLedgerConfig, code: Cell, workchain = 0) {
        const data = optionLedgerConfigToCell(config);
        const init = { code, data };
        return new OptionLedger(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendStartOptionLedger(
        provider: ContractProvider,
        via: Sender
    ) {
        await provider.internal(via, {
            value: toNano('0.01'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.startOptionLedger, 32)
                .storeUint(0, 64)
                .endCell(),
        });
    }


    async sendPlacePutOrder(
        provider: ContractProvider,
        via: Sender,
        opts: {
            optionLedgerId: number;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.placePutOrder, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.optionLedgerId, 256)
                .endCell(),
        });
    }

    async sendPlaceCallOrder(
        provider: ContractProvider,
        via: Sender,
        opts: {
            optionLedgerId: number;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.placeCallOrder, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.optionLedgerId, 256)
                .endCell(),
        });
    }

    async sendProcessOptionLedger(
        provider: ContractProvider,
        via: Sender,
        opts: {
            optionLedgerId: number;
            feePercent: number,
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.processOptionLedger, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.optionLedgerId, 256)
                .storeUint(opts.feePercent, 32)
                .endCell(),
        });
    }

    async getUserTotalAmount(provider: ContractProvider){
        const result = await provider.get('get_total_users_amount', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }

    async getOptionLedgerId(provider: ContractProvider) {
        const result = await provider.get('get_option_ledger_id', []);
        return result.stack.readNumber();
    }

    async getAdminUser(provider: ContractProvider) {
        const result = await provider.get('get_admin', []);
        return result.stack.readAddress();
    }

    async getFeeCollector(provider: ContractProvider) {
        const result = await provider.get('get_fee_collector', []);
        return result.stack.readAddress();
    }

    async getUser(provider: ContractProvider, address: Cell) {
        // create address from string as Cell
        const result = await provider.get('get_user', [{ type: 'slice', cell: address }]);
        let item = result.stack['items'];
        // get optionledger
        let optionLedgerId = item[0].value.toString();
        let optionType = item[1].value.toString();
        let optionAmount = item[2].value.toString();
        item.forEach((element: any) => {
            // console.log(element.value.toString());
        });
        return ({ optionLedgerId, optionType, optionAmount });
    }

    async getAwaitingUser(provider: ContractProvider, address: Cell) {
        const result = await provider.get('get_awaiting_user', [{ type: 'slice', cell: address }]);
        let item = result.stack['items'];
        // get optionledger
        let optionLedgerId = item[0].value.toString();
        let optionType = item[1].value.toString();
        let optionAmount = item[2].value.toString();
        item.forEach((element: any) => {
            // console.log(element.value.toString());
        });
        return ({ optionLedgerId, optionType, optionAmount });
    }

    async getUsers(provider: ContractProvider) {
        let returnList: { [key: string]: { optionLedgerId: string, optionType: string, optionAmount: string } } = {};
        const result = await provider.get('get_users', []);
        const listResult = result.stack.readLispList();
        // console.log(listResult.toString());

        // read FunC list of tuples
        listResult.forEach((element: any) => {
            // console.log('Type: ' + element.type);

            // abstract address
            let addressItem = element.items[0];
            let addr = addressItem.cell.beginParse();
            let address = addr.loadAddress();
            addr.endParse();

            // read option ledger id
            let optionLedgerId = element.items[1].value.toString();
            let optionType = element.items[2].value.toString();
            let optionAmount = element.items[3].value.toString();
            returnList[address.toString()] = {
                optionLedgerId: optionLedgerId,
                optionType: optionType,
                optionAmount: optionAmount
            };
        });
        return (returnList);
    }

    async getUsersV2(provider: ContractProvider) {
        let returnList: { [key: string]: { optionLedgerId: string, optionType: string, optionAmount: string } } = {};
        const result = await provider.get('get_users', []);
        let _ = result.stack.readLispList().forEach((element: any) => {
            if (element.type === 'tuple') {
                // console.log('Type: ' + element.type);
                if (element.items !== undefined || element.items !== null) {
                    if (element.items.length > 0) {
                        let address = element.items[0].cell.beginParse().loadAddress();
                        let optionLedgerId = element.items[1].value.toString();
                        let optionType = element.items[2].value.toString();
                        let optionAmount = element.items[3].value.toString();
                        element.items.forEach((item: any) => {
                            if (item.type !== 'null') {
                                // console.log('Item: ' + item.type);

                                if (item.type === 'slice') {
                                    // console.log('Item: ' + item.cell.toString());
                                }
                                if (item.type == "int") {
                                    // console.log('Item: ' + item.value.toString());
                                }
                            }
                        });
                        returnList[address.toString()] = {
                            optionLedgerId: optionLedgerId,
                            optionType: optionType,
                            optionAmount: optionAmount
                        };
                    }
                }
            }
        });
        return (returnList);
    }

    async getAwaitingUsers(provider: ContractProvider) {
        let returnList: { [key: string]: { optionLedgerId: string, optionType: string, optionAmount: string } } = {};
        const result = await provider.get('get_awaiting_users', []);
        let _ = result.stack.readLispList().forEach((element: any) => {
            if (element.type === 'tuple') {
                // console.log('Type: ' + element.type);
                if (element.items !== undefined || element.items !== null) {
                    if (element.items.length > 0) {
                        let address = element.items[0].cell.beginParse().loadAddress();
                        let optionLedgerId = element.items[1].value.toString();
                        let optionType = element.items[2].value.toString();
                        let optionAmount = element.items[3].value.toString();
                        element.items.forEach((item: any) => {
                            if (item.type !== 'null') {
                                // console.log('Item: ' + item.type);

                                if (item.type === 'slice') {
                                    // console.log('Item: ' + item.cell.toString());
                                }
                                if (item.type == "int") {
                                    // console.log('Item: ' + item.value.toString());
                                }
                            }
                        });
                        returnList[address.toString()] = {
                            optionLedgerId: optionLedgerId,
                            optionType: optionType,
                            optionAmount: optionAmount
                        };
                    }
                }
            }
        });
        return (returnList);
    }

}