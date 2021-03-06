import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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

export default function MakeBorrowForm(props) {
  const { api } = useSubstrate();

  const [balance, setBalance] = useState(0);

  // for form
  const [collateralBalance, setCollateralBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [terms, setTerms] = useState(0);
  const [interestRate, setInterestRate] = useState(0);

  const [tradingPairs, setTradingPairs] = useState({});
  const [status, setStatus] = useState(null);
  const { t } = useTranslation()
  const accountPair = props.accountPair;
  const symbolsMapping = props.symbolsMapping;
  const hideModal = props.hideModal;

  // get trading pair
  useEffect(() => {
    api.query.pToP.tradingPairs(res => {
      // temporarily get first trading pair
      setTradingPairs(JSON.parse(res)[0])
    })
  }, [api.query.pToP])

  // get balance
  useEffect(() => {
    if (tradingPairs.collateral) {
      let unsubscribeAll = null;
      api.query.genericAsset.freeBalance(tradingPairs.collateral, accountPair.address).then(res => {
        setBalance(String(new Decimal(Number(res)).dividedBy(10 ** 8)))
      }).then(unsub => {
        unsubscribeAll = unsub;
      })
      return () => unsubscribeAll && unsubscribeAll();
    }
  }, [accountPair.address, api.query.genericAsset, tradingPairs])

  // hide modal when completed
  useEffect(() => {
    if (status === 'complete') {
      hideModal()
    }
  }, [status, hideModal])

  return (
    <Spin spinning={status === 'loading'}>
      <form>
        {tradingPairs && (
          <Form.Item
            {...formItemLayout}
            label={t('form.collateral')}
          >
            <span className="ant-form-text">
              {symbolsMapping[tradingPairs.collateral]}
            </span>
          </Form.Item>
        )}
        {
          tradingPairs && (
            <Form.Item
              {...formItemLayout}
              label={t('form.borrow')}
            >
              <span className="ant-form-text">
                {symbolsMapping[tradingPairs.borrow]}
              </span>
            </Form.Item>
          )
        }
        <Form.Item
          {...formItemLayout}
          label={t('form.balance')}
        >
          <span className="ant-form-text">
            {balance} {symbolsMapping[tradingPairs.collateral]}
          </span>
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('form.collateralBalance')}
        >
          <Input value={collateralBalance} onChange={event => { setCollateralBalance(event.target.value) }} />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('form.borrowAmount')}
        >
          <Input value={amount} onChange={event => setAmount(event.target.value)} />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('form.terms')}
        >
          <Input value={terms} onChange={event => setTerms(event.target.value)} suffix={t('common.days')} />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('form.interestRate')}
        >
          <Input value={interestRate} onChange={event => setInterestRate(event.target.value)} suffix="‱ Per Day" />
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <TxButton
            accountPair={accountPair}
            label={t('action.make')}
            setStatus={setStatus}
            type='TRANSACTION'
            attrs={{
              params: [collateralBalance && Number(new Decimal(collateralBalance).times(10 ** 8)),
              tradingPairs,
              {
                amount: amount && Number(new Decimal(amount).times(10 ** 8)),
                terms: Number(terms),
                interest_rate: interestRate && Number(new Decimal(interestRate).times(10 ** 4))
              }
              ],
              tx: api.tx.pToP.make
            }}
          />
        </Form.Item>
      </form>

    </Spin>

  )
}
