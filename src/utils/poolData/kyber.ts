import { BigNumber, Contract } from 'ethers'

import {
  KYBER_FACTORY,
  KYBER_FACTORY_ABI,
  KYBER_POOL_ABI,
  TEN_POW_18,
} from 'utils/constants/constants'
import { WETH } from 'utils/constants/tokens'
import { getProvider } from 'utils/provider'
import { LiquidityBalance } from './types'

export async function getKyberLiquidity(
  tokenAddress: string
): Promise<LiquidityBalance> {
  let response = {
    tokenBalance: BigNumber.from(0),
    wethBalance: BigNumber.from(0),
  }
  const provider = getProvider()
  const factoryInstance = await new Contract(
    KYBER_FACTORY,
    KYBER_FACTORY_ABI,
    provider
  )

  const pools = await factoryInstance.getPools(tokenAddress, WETH)
  if (!pools[0]) return response

  const pairContract = await new Contract(pools[0], KYBER_POOL_ABI, provider)
  const [tokenBalance, wethBalance] = await pairContract.getReserves()

  return {
    tokenBalance: tokenBalance.div(TEN_POW_18),
    wethBalance: wethBalance.div(TEN_POW_18)
  }
}
