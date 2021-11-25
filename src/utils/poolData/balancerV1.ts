import { BigNumber, Contract } from 'ethers'

import {
  BALANCER_OCR,
  BALANCER_OCR_ABI,
  TEN_POW_18,
} from 'utils/constants/constants'
import { getProvider } from 'utils/provider'
import { ERC20_ABI, WETH } from 'utils/constants/tokens'
import { LiquidityBalance } from './types'

// Usage note, targetPriceImpact should be the impact including fees! Balancer pool fees can change and it's not easy to extract from the data
// we have so put in a number that is net of fees.
export async function getBalancerV1Liquidity(
  tokenAddress: string
): Promise<LiquidityBalance> {
  let response = {
    tokenBalance: BigNumber.from(0),
    wethBalance: BigNumber.from(0),
  }
  let tokenBalances: BigNumber[] = []
  let wethBalances: BigNumber[] = []
  const provider = getProvider()
  const ocr = await new Contract(BALANCER_OCR, BALANCER_OCR_ABI, provider)
  const tokenContract = await new Contract(tokenAddress, ERC20_ABI, provider)
  const wethContract = await new Contract(WETH, ERC20_ABI, provider)
  const pools: string[] = await ocr.getBestPools(WETH, tokenAddress)

  if (pools.length < 1) return response

  await Promise.all(
    pools.map(async (pool) => {
      tokenBalances.push(await tokenContract.balanceOf(pool))
      wethBalances.push(await wethContract.balanceOf(pool))
    })
  )

  const reducer = (previousValue: BigNumber, currentValue: BigNumber) =>
    previousValue.add(currentValue)
  return {
    tokenBalance: tokenBalances.reduce(reducer).div(TEN_POW_18),
    wethBalance: wethBalances.reduce(reducer).div(TEN_POW_18),
  }
}
