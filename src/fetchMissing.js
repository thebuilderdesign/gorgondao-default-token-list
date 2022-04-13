const fetch = require('node-fetch')
const utils = require('web3-utils')

async function getLogo(xdaiAddr) {
  const response = await fetch(`https://blockscout.com/poa/xdai/tokens/${xdaiAddr}/token-transfers`)
  const text = await response.text()
  const mainnetAddr = text.match(/https:\/\/etherscan.io\/token\/(0x[a-fA-F0-9]{40})/)[1]
  const formattedAddr = utils.toChecksumAddress(mainnetAddr)
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${formattedAddr}/logo.png`
}

async function fetchMissing() {
  const response = await fetch(
    'https://raw.githubusercontent.com/baofinance/tokenlists/main/cro.json'
  )
  const data = await response.json()
  const bridgedTokens = [...new Set(data.result.map(x => x.contractAddress.toLowerCase()))]

  const response2 = await fetch('https://raw.githubusercontent.com/thebuilderdesign/tokenlists/main/cro.json')
  const data2 = await response2.json()

  const listedTokens = data2.tokens.map(x => x.address.toLowerCase())
  const missingTokens = bridgedTokens.filter(x => !listedTokens.includes(x))
  return Promise.all(
    missingTokens
      .map(x => data.result.find(y => y.contractAddress === x))
      .map(async ({ tokenName, tokenSymbol, tokenDecimal, contractAddress }) => {
        const logoURI = await getLogo(contractAddress)
        return {
          name: tokenName,
          address: contractAddress,
          symbol: tokenSymbol,
          decimals: parseInt(tokenDecimal),
          chainId: 25,
          logoURI
        }
      })
  )
}

fetchMissing().then(x => console.log(JSON.stringify(x, null, '  ')))
