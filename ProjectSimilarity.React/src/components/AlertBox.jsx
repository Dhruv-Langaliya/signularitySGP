import React from 'react';
import { useApp } from '../AppContext';

export default function AlertBox() {
  const { alert } = useApp();
  if (!alert.visible) return null;

  return (
    <div
      id="alertBox"
      className={`alert ${alert.isError ? 'alert-error' : 'alert-success'}`}
      style={{ display: 'block' }}
    >
      {alert.msg}
    </div>
  );
}
