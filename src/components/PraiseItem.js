import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Avatar, Popover, Spin } from 'antd';
import * as request from '../common/request';
import './PraiseItem.css';

function PraiseTarget ({ userId }) {
  const [user, setUser] = useState({});
  useEffect(() => {
    async function getUser() {
      const res = await request.get(`/users/${userId}`);
      if (res.success) {
        setUser(res.payload);
      }
    }
    getUser();
  }, [userId]);
  if (!user || !user.id) {
    return <Spin size="small" />;
  }
  return (
    <div className="praise-target">
      <Avatar {...user.avatar ? { src: user.avatar } : { icon: 'user' }} />
      <span className="user-name">{user.name}</span>
    </div>
  );
}

function PraiseText (text = '') {
  const regex = /(@)(.+?)(\s)/;
    
  let subText = text;
  const cps = [];
  while (regex.test(subText)) {
    const match = regex.exec(subText);
    const index = match.index;
    const userId = match[2];

    cps.push(<span key={cps.length}>{subText.slice(0, index)}</span>);
    cps.push(
      <Popover key={cps.length} placement="topLeft" content={<PraiseTarget userId={userId} />}>
        <span className="highlight">@{userId}</span>
      </Popover>
    );
    subText = subText.slice(match.index + match[0].length - 1);
  }
  cps.push(<span key={cps.length}>{subText}</span>);

  return cps;
}

function PraiseItem (props) {
  const { data = {} } = props;
  return (
    <div className="praise-item">
      <div className="praise-text">
        {PraiseText(data.content)}
      </div>
      <div className="praise-time">
        {moment(data.createdTime).format('YYYY-MM-DD HH:mm:ss')}
      </div>
    </div>
  );
}

export default PraiseItem;
