import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listContract(query) {
  return request({
    url: '/contract/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getContract(id) {
  return request({
    url: '/contract/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addContract(data) {
  return request({
    url: '/contract',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateContract(data) {
  return request({
    url: '/contract',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delContract(id) {
  return request({
    url: '/contract/' + id,
    method: 'delete'
  })
}

// 获取所有用户列表
export function getAllUser() {
  return request({
    url: '/system/user/list',
    method: 'get'
  })
}

// 提交合同
export function submitContract(data) {
  return request({
    url: '/contract/submit/',
    method: 'post',
    data: data
  })
}