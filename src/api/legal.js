import request from '@/utils/request'

// 查询法务列表
export function listLegal(query) {
  return request({
    url: '/contract/approval/legal',
    method: 'get',
    params: query
  })
}
export function getApproval(id) {
  return request({
    url: '/contract/approval/' + id,
    method: 'get'
  })
}
// 修改审核
export function approve(data) {
  return request({
    url: '/contract/approval/legal/approve',
    method: 'put',
    data: data
  })
}

// 提交reject
export function reject(data) {
  return request({
    url: '/contract/approval/legal/reject',
    method: 'put',
    data: data
  })
}
