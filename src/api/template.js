import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listTemplates(query) {
  return request({
    url: '/contract/templates/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getTemplates(id) {
  return request({
    url: '/contract/templates/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addTemplates(data) {
  return request({
    url: '/templates',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateTemplates(data) {
  return request({
    url: '/templates',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delTemplates(id) {
  return request({
    url: '/contract/templates/' + id,
    method: 'delete'
  })
}

// 上传文件接口
export function uploadTemplate(params) {
  return request({
    url: 'contract/templates/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: params
  })
}