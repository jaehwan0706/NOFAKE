<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> d9c1ac901667ee688df49dc96eba19e2899684b6
/*
 * SPDX-License-Identifier: Apache-2.0
 */
package org.hyperledger.fabric.samples.erc20.model;

import com.owlike.genson.annotation.JsonProperty;
import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;

@DataType()
public final class Approval {

  @Property()
  @JsonProperty("owner")
  private String owner;

  @Property()
  @JsonProperty("spender")
  private String spender;

  @Property()
  @JsonProperty("value")
  private long value;

  /** Default constructor */
  public Approval() {
    super();
  }

  /**
   * Constructor of the class
   *
   * @param owner token owner
   * @param spender approved spender of the token
   * @param value amount approved as allowance
   */
  public Approval(
      @JsonProperty("owner") final String owner,
      @JsonProperty("spender") final String spender,
      @JsonProperty("value") final long value) {
    super();
    this.owner = owner;
    this.spender = spender;
    this.value = value;
  }

  public String getOwner() {
    return owner;
  }

  public String getSpender() {
    return spender;
  }

  public long getValue() {
    return value;
  }
}
<<<<<<< HEAD
=======
/*
 * SPDX-License-Identifier: Apache-2.0
 */
package org.hyperledger.fabric.samples.erc20.model;

import com.owlike.genson.annotation.JsonProperty;
import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;

@DataType()
public final class Approval {

  @Property()
  @JsonProperty("owner")
  private String owner;

  @Property()
  @JsonProperty("spender")
  private String spender;

  @Property()
  @JsonProperty("value")
  private long value;

  /** Default constructor */
  public Approval() {
    super();
  }

  /**
   * Constructor of the class
   *
   * @param owner token owner
   * @param spender approved spender of the token
   * @param value amount approved as allowance
   */
  public Approval(
      @JsonProperty("owner") final String owner,
      @JsonProperty("spender") final String spender,
      @JsonProperty("value") final long value) {
    super();
    this.owner = owner;
    this.spender = spender;
    this.value = value;
  }

  public String getOwner() {
    return owner;
  }

  public String getSpender() {
    return spender;
  }

  public long getValue() {
    return value;
  }
}
>>>>>>> d00e0fd0602b50ff668739c7df29b95450bbacd5
=======
>>>>>>> d9c1ac901667ee688df49dc96eba19e2899684b6
