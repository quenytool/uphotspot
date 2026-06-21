# 今日热榜 API 文档

## 概述

本文档描述今日热榜的数据 API 接口。

## 数据格式

所有 API 返回 JSON 格式数据。

### 成功响应

```json
{
  "source": "weibo",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "count": 50,
  "data": [
    {
      "id": "weibo-1",
      "title": "热搜标题",
      "url": "https://weibo.com/...",
      "source": "weibo",
      "rank": 1,
      "heat": "1000万",
      "category": "social",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

## 热榜数据 API

### 获取微博热榜

```
GET /api/weibo
```

### 获取知乎热榜

```
GET /api/zhihu
```

### 获取抖音热榜

```
GET /api/douyin
```

### 获取腾讯新闻热榜

```
GET /api/qq-news
```

### 获取百度热榜

```
GET /api/baidu
```

### 获取头条热榜

```
GET /api/toutiao
```

### 获取综合热榜

```
GET /api/all
```

返回所有平台的热榜汇总数据。

## 热榜字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| title | string | 热榜标题 |
| url | string | 原文链接 |
| source | string | 来源平台 |
| rank | number | 排名 |
| heat | string | 热度值 |
| category | string | 分类 |
| createdAt | string | 抓取时间 (ISO 8601) |

## 错误码

| 错误码 | 说明 |
|--------|------|
| 1000 | 数据不存在 |
| 1001 | 数据获取失败 |
| 1002 | 服务内部错误 |

## 使用限制

- 请求频率限制：每分钟 60 次
- 请勿高频轮询，建议使用缓存
- 建议在服务器端缓存数据

## 示例

### JavaScript

```javascript
const response = await fetch('/api/weibo')
const data = await response.json()
console.log(data.data)
```

### Python

```python
import requests

response = requests.get('/api/weibo')
data = response.json()
print(data['data'])
```
