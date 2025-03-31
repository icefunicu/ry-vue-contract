import request from '@/utils/request'

// 生成企业签章-上传生成
export function generateUpload(data) {
  return request({
    url: '/openSign/clip/seal',
    method: 'post',
    data: data
  })
}

// 生成企业签章-参数生成
export function generateSeal(data) {
  return request({
    url: '/openSign/generate/seal',
    method: 'post',
    data: data
  })
}

// 签署合同
export function signContract(data) {
  return request({
    url: '/openSign/sign',
    method: 'post',
    data: data
  })
}