import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'func',
    targets: ['contracts/stdlib.fc', 'contracts/mode.fc','contracts/error.fc','contracts/util.fc','contracts/storage.fc','contracts/guard.fc','contracts/get.fc','contracts/option_ledger.fc'],
};
