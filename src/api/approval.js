import request from '@/utils/request'

// 查询审核列表
export function listApproval(query) {
  return request({
    url: '/contract/approval/list',
    method: 'get',
    params: query
  })
}

// 查询审核详细
export function getApproval(id) {
  return request({
    url: '/contract/approval/' + id,
    method: 'get'
  })
}

// 新增审核
export function addApproval(data) {
  return request({
    url: '/contract/approval',
    method: 'post',
    data: data
  })
}

// 修改审核
export function updateApproval(data) {
  return request({
    url: '/contract/approval',
    method: 'put',
    data: data
  })
}

// 删除审核
export function delApproval(id) {
  return request({
    url: '/contract/approval/' + id,
    method: 'delete'
  })
}

// 修改审核
export function approve(data) {
  return request({
    url: '/contract/approval/approve',
    method: 'put',
    data: data
  })
}
