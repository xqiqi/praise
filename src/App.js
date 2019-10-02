import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { message, Avatar, Empty, Mentions, Spin, Button } from 'antd';
import * as request from './common/request';
import PraiseItem from './components/PraiseItem';
import './App.css';

const pageSize = 20;

@observer
class App extends Component {
  componentDidMount() {
    this.getPraises();
  }

  @action
  async getPraises() {
    this.loading = true;
    const res = await request.get(`/praises?_sort=createdTime&_order=desc&_page=${this.page}&_limit=${pageSize}`);
    if (res.success) {
      const { payload = [], _metadata = {} } = res;
      this.praises = this.page === 1 ? payload : this.praises.concat(payload);
      this.hasNextPage = _metadata.total_count / pageSize > this.page;
    } else {
      message.error(res.message);
    }
    this.loading = false;
  }

  @action
  async getUsers(keyword) {
    this.fetching = true;
    const res = await request.get(`/users?name_like=${keyword}`);
    if (res.success) {
      this.users = res.payload;
    } else {
      this.users = [];
    }
    this.fetching = false;
  }

  @observable loading = false;
  @observable praises = [];
  @observable page = 1;
  @observable hasNextPage = false;
  @observable users = [];
  @observable fetching = false;
  @observable praiseText = '';
  @observable submitting = false;

  @action
  handleLoadMore = () => {
    this.page += 1;
    this.getPraises();
  }

  handleUserSearch = (search) => {
    if (search && search === this.searchKeyword) return;
    this.searchKeyword = search;
    this.getUsers(search);
  }

  @action
  handleTextChange = (text) => {
    this.praiseText = text;
  }

  @action
  handleSubmit = async () => {
    this.submitting = true;
    const currentTime = new Date();
    const res = await request.post('/praises', {
      id: `praise-${currentTime.valueOf()}`,
      content: this.praiseText,
      createdTime: currentTime.toISOString(),
    });
    if (res.success) {
      this.praiseText = '';
      this.page = 1;
      this.getPraises();
    } else {
      message.error(res.message);
    }
    this.submitting = false;
  }

  render() {
    return (
      <div>
        <div className="header">
          <div className="praise-title">Praise Your Coworkers Now!</div>
          <Mentions
            loading={this.fetching}
            value={this.praiseText}
            rows={3}
            placeholder="@ your coworkers now..."
            className="praise-input"
            onSearch={this.handleUserSearch}
            onChange={this.handleTextChange}
          >
            {this.users.map(user => (
              <Mentions.Option key={user.id} value={user.id}>
                <Avatar {...user.avatar ? { src: user.avatar } : { icon: 'user' }} />
                <span style={{ marginLeft: 12 }}>
                  {user.name} ({user.id})
                </span>
              </Mentions.Option>
            ))}
          </Mentions>
          <Button
            type="primary"
            size="large"
            className="praise-submit-btn"
            disabled={!this.praiseText}
            loading={this.submitting}
            onClick={this.handleSubmit}
          >
            Submit
          </Button>
        </div>
        <div className="content">
          {this.praises.map(praise => (
            <div key={praise.id} className="praise-item-container">
              <PraiseItem data={praise} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          {
            this.loading&&<Spin />
          }
          {
            !this.loading && this.praises.length <= 0 && <Empty />
          }
          {
            !this.loading && this.praises.length > 0 && this.hasNextPage
            &&
            <Button type="link" onClick={this.handleLoadMore}>Load More</Button>
          }
        </div>
      </div>
    );
  }
}

export default App;
