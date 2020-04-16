import React, { useState, useEffect } from 'react'
import { Form, Input, Spin } from 'antd'
import { TxButton } from 'substrate-lib/components';
import { useSubstrate } from 'substrate-lib';
import { Decimal } from 'decimal.js'

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

export default function MarkLiquidatedForm(props) {
  const { api } = useSubstrate();
  const [auctionBalance, setAuctionBalance] = useState(0)
  const [status, setStatus] = useState(null);
  const accountPair = props.accountPair;
  const hideModal = props.hideModal;
  const symbolsMapping = props.symbolsMapping;
  const item = props.item;
  // hide modal when completed
  useEffect(() => {
    if (status === 'complete') {
      hideModal()
    }
  }, [status, hideModal])

  return (
    <Spin spinning={status === 'loading'}>
      <form>
        <Form.Item
          {...formItemLayout}
          label={'Loan Id'}
        >
          <span className="ant-form-text">{item.id}</span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={'Auction Balance'}
        >
          <Input value={auctionBalance} onChange={event => setAuctionBalance(event.target.value)} suffix={symbolsMapping[1]} />
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label='Mark'
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [item.id, Number(new Decimal(auctionBalance).times(10 ** 8))],
              tx: api.tx.depositLoan.markLiquidated
            }}
          />
        </Form.Item>
      </form>
    </Spin>
  )
}
