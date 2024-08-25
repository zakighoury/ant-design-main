"use client";
import React from 'react';
import { Form, DatePicker, Button } from 'antd';
import { format } from 'date-fns';

const DateTimeForm = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form:', {
      ...values,
      dateTime: format(values.dateTime.toDate(), 'yyyy-MM-dd HH:mm:ss')
    });
  };

  return (
    <Form
      form={form}
      name="date_time_form"
      onFinish={onFinish}
      layout="vertical"
      initialValues={{
        dateTime: null
      }}
    >
      <Form.Item
        name="dateTime"
        label="Date and Time"
        rules={[{ required: true, message: 'Please select date and time!' }]}
      >
        <DatePicker showTime />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DateTimeForm;
