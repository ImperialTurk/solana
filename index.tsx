import * as Web3 from '@solana/web3.js'
import type { NextPage } from 'next'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import AddressForm from '../components/AddressForm'
import { Keypair } from "@solana/web3.js"
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function initializeKeypair(
  connection: Web3.Connection
): Promise<Web3.Keypair> {
  if (!process.env.PRIVATE_KEY) {
    console.log('Generating new keypair... 🗝️');
    const signer = Web3.Keypair.generate();

    console.log('Creating .env file');
    fs.writeFileSync('.env', `PRIVATE_KEY=[${signer.secretKey.toString()}]`);

    return signer;
  }
  const ownerKeypair = Keypair.generate()
  const publicKey = ownerKeypair.publicKey
  const secret = JSON.parse(process.env.PRIVATE_KEY ?? '') as number[];
  const secretKey = Uint8Array.from(secret);
  const keypairFromSecret = Web3.Keypair.fromSecretKey(secretKey);
  return keypairFromSecret;
}

const transaction = new Transaction()

const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: recipient,
    lamports: LAMPORTS_PER_SOL * amount
})

transaction.add(sendSolInstruction)

const signature = sendAndConfirmTransaction(
    connection,
    transaction,
    [senderKeypair])

async function callProgram(
  connection: Web3.Connection,
  payer: Web3.Keypair,
  programId: Web3.PublicKey,
  programDataAccount: Web3.PublicKey
) {
  const instruction = new Web3.TransactionInstruction({
      // We only have one key here
      keys: [
          {
              pubkey: programDataAccount,
              isSigner: false,
              isWritable: true
          },
      ],
      
      // The program we're interacting with
      programId
      
      // We don't have any data here!
  })

  const sig = await Web3.sendAndConfirmTransaction(
      connection,
      new Web3.Transaction().add(instruction),
      [payer]
  )
}


  async function main() {
    const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'));
    const signer = await initializeKeypair(connection);
  
    console.log("Public key:", signer.publicKey.toBase58());
  }
  main()
  .then(() => {
    console.log('Finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });



const Home: NextPage = () => {
  const [balance, setBalance] = useState(0)
  const [address, setAddress] = useState('')
  const [isExecutable, setIsExecutable] = useState(false);

  const addressSubmittedHandler = (address: string) => {
    try {
      setAddress(address)
      const key = new Web3.PublicKey(address)
      const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'))
      connection.getBalance(key).then(balance => {
        setBalance(balance / Web3.LAMPORTS_PER_SOL)
      })
      connection.getAccountInfo(key).then(info => {
      setIsExecutable(info?.executable ?? false);
      })
    } catch (error) {
      setAddress('')
      setBalance(0)
      alert(error)
    }
  }

  return (
    <div className={styles.App}>
      <header className={styles.AppHeader}>
        <p>
          Start Your Solana Journey
        </p>
        <AddressForm handler={addressSubmittedHandler} />
        <p>{`Address: ${address}`}</p>
        <p>{`Balance: ${balance} SOL`}</p>
        <p>{`Is it executable? ${isExecutable ? 'Yep' : 'Nope'}`}</p>
      </header>
    </div>
  )
}

export default Home
