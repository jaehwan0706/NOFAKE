<<<<<<< HEAD
/*
 * SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric.samples.erc20;

/** ERC20 constants for KEYS ,EVENTS and MSP */
public enum ContractConstants {
  BALANCE_PREFIX("balance"),
  ALLOWANCE_PREFIX("allowance"),
  NAME_KEY("name"),
  SYMBOL_KEY("symbolKey"),
  DECIMALS_KEY("decimals"),
  TOTAL_SUPPLY_KEY("totalSupply"),
  TRANSFER_EVENT("Transfer"),
  MINTER_ORG_MSPID("Org1MSP"),
  APPROVAL("Approval");

  private final String prefix;

  ContractConstants(final String value) {
    this.prefix = value;
  }

  public String getValue() {
    return prefix;
  }
}
=======
/*
 * SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric.samples.erc20;

/** ERC20 constants for KEYS ,EVENTS and MSP */
public enum ContractConstants {
  BALANCE_PREFIX("balance"),
  ALLOWANCE_PREFIX("allowance"),
  NAME_KEY("name"),
  SYMBOL_KEY("symbolKey"),
  DECIMALS_KEY("decimals"),
  TOTAL_SUPPLY_KEY("totalSupply"),
  TRANSFER_EVENT("Transfer"),
  MINTER_ORG_MSPID("Org1MSP"),
  APPROVAL("Approval");

  private final String prefix;

  ContractConstants(final String value) {
    this.prefix = value;
  }

  public String getValue() {
    return prefix;
  }
}
>>>>>>> d00e0fd0602b50ff668739c7df29b95450bbacd5
