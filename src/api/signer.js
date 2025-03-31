import request from '@/utils/request'

// 查询合同签署列表
export function listSigner(query) {
  return request({
    url: '/contract/signer/list',
    method: 'get',
    params: query
  })
}

// 查询合同签署详细
export function getSigner(id) {
  return request({
    url: '/contract/signer/' + id,
    method: 'get'
  })
}

// 新增合同签署
export function addSigner(data) {
  return request({
    url: '/contract/signer',
    method: 'post',
    data: data
  })
}

// 修改合同签署
export function updateSigner(data) {
  return request({
    url: '/contract/signer',
    method: 'put',
    data: data
  })
}

// 删除合同签署
export function delSigner(id) {
  return request({
    url: '/contract/signer/' + id,
    method: 'delete'
  })
}
