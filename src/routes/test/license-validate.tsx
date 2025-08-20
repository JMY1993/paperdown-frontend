import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useValidateUserLicense } from '@/services/license'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import axios from '@/lib/axios'

export const Route = createFileRoute('/test/license-validate')({
  component: LicenseValidateTest,
})

// Challenge转换器（复制后端逻辑）
function transformChallenge(challenge: string, requestBody: string): string {
  const totalChars = requestBody.length
  const challengeLength = challenge.length
  if (challengeLength === 0) return ""
  
  const rotatePos = totalChars % challengeLength
  const rotated = challenge.substring(rotatePos) + challenge.substring(0, rotatePos)
  
  
  return rotated.length > 16 ? rotated.substring(0, 16) : rotated
}

// 计算响应哈希 (使用Web Crypto API)
async function calculateHash(responseBody: string, challenge: string, requestBody: string): Promise<string> {
  const salt = transformChallenge(challenge, requestBody)
  const data = responseBody + salt
  
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = new Uint8Array(hashBuffer)
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

function LicenseValidateTest() {
  const [serviceName, setServiceName] = useState('')
  const [challenge, setChallenge] = useState('')
  const [result, setResult] = useState<any>(null)
  const [secureResult, setSecureResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [secureError, setSecureError] = useState<string | null>(null)
  const [hashVerification, setHashVerification] = useState<any>(null)
  const [timestampInfo, setTimestampInfo] = useState<any>(null)
  
  const validateMutation = useValidateUserLicense()

  const handleValidate = async () => {
    if (!serviceName.trim()) {
      setError('请输入服务名称')
      return
    }

    try {
      setError(null)
      const response = await validateMutation.mutateAsync({
        service_name: serviceName.trim()
      })
      setResult(response)
    } catch (err: any) {
      console.error('Validate error:', err)
      let errorMessage = '验证失败'
      if (err.response) {
        errorMessage = `${err.response.status}: ${err.response.data?.message || err.response.statusText}`
      } else if (err.request) {
        errorMessage = 'Network Error: 无法连接到服务器。请检查网络连接或确保已登录。'
      } else {
        errorMessage = err.message || '未知错误'
      }
      setError(errorMessage)
      setResult(null)
    }
  }

  const handleSecureValidate = async () => {
    if (!serviceName.trim()) {
      setSecureError('请输入服务名称')
      return
    }
    if (!challenge.trim()) {
      setSecureError('请输入Challenge值')
      return
    }

    try {
      setSecureError(null)
      setHashVerification(null)
      
      const requestData = { service_name: serviceName.trim() }
      const requestBody = JSON.stringify(requestData)
      
      
      const response = await axios.post('/api/v1/license/validate-secure', requestData, {
        headers: {
          'X-Challenge': challenge.trim()
        }
      })
      
      const responseHash = response.headers['x-response-hash']
      // 使用与后端相同的紧凑JSON格式
      const responseBody = JSON.stringify(response.data, null, 0)
      
      // 计算期望的哈希值
      const expectedHash = await calculateHash(responseBody, challenge.trim(), requestBody)
      const hashValid = responseHash === expectedHash
      
      setSecureResult(response.data)
      setHashVerification({
        received: responseHash,
        expected: expectedHash,
        valid: hashValid,
        responseBody,
        requestBody,
        challenge: challenge.trim(),
        salt: transformChallenge(challenge.trim(), requestBody)
      })
    } catch (err: any) {
      console.error('Secure validate error:', err)
      let errorMessage = '验证失败'
      if (err.response) {
        // 服务器响应了错误状态码
        errorMessage = `${err.response.status}: ${err.response.data?.message || err.response.statusText}`
      } else if (err.request) {
        // 请求已发出但没有收到响应
        errorMessage = 'Network Error: 无法连接到服务器。请检查网络连接或确保已登录。'
      } else {
        // 其他错误
        errorMessage = err.message || '未知错误'
      }
      setSecureError(errorMessage)
      setSecureResult(null)
      setHashVerification(null)
    }
  }

  const generateRandomChallenge = () => {
    // 生成带时间戳的Challenge: timestamp_hex(8位) + random_string(24位)
    const timestamp = Math.floor(Date.now() / 1000) // Unix时间戳
    const timestampHex = timestamp.toString(16).padStart(8, '0') // 转为8位十六进制
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let randomPart = ''
    for (let i = 0; i < 24; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    const challengeWithTimestamp = timestampHex + randomPart
    setChallenge(challengeWithTimestamp)
    
    const timestampData = {
      timestamp,
      timestampHex,
      randomPart,
      fullChallenge: challengeWithTimestamp,
      readableTime: new Date(timestamp * 1000).toLocaleString(),
      ageInSeconds: 0
    }
    setTimestampInfo(timestampData)
    
    console.log('Generated Challenge:', timestampData)
  }

  const generateExpiredChallenge = () => {
    // 生成一个6分钟前的过期Challenge用于测试
    const timestamp = Math.floor(Date.now() / 1000) - 360 // 6分钟前
    const timestampHex = timestamp.toString(16).padStart(8, '0')
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let randomPart = ''
    for (let i = 0; i < 24; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    const expiredChallenge = timestampHex + randomPart
    setChallenge(expiredChallenge)
    
    const timestampData = {
      timestamp,
      timestampHex,
      randomPart,
      fullChallenge: expiredChallenge,
      readableTime: new Date(timestamp * 1000).toLocaleString(),
      ageInSeconds: 360
    }
    setTimestampInfo(timestampData)
    
    console.log('Generated Expired Challenge:', timestampData)
  }

  const parseExistingChallenge = () => {
    if (!challenge || challenge.length < 8) {
      setTimestampInfo(null)
      return
    }
    
    try {
      const timestampHex = challenge.substring(0, 8)
      const randomPart = challenge.substring(8)
      const timestamp = parseInt(timestampHex, 16)
      const now = Math.floor(Date.now() / 1000)
      const ageInSeconds = now - timestamp
      
      const timestampData = {
        timestamp,
        timestampHex,
        randomPart,
        fullChallenge: challenge,
        readableTime: new Date(timestamp * 1000).toLocaleString(),
        ageInSeconds
      }
      setTimestampInfo(timestampData)
      
      console.log('Parsed Challenge:', timestampData)
    } catch (error) {
      console.error('Failed to parse challenge:', error)
      setTimestampInfo(null)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>服务授权验证测试</CardTitle>
          <p className="text-sm text-gray-600">
            测试当前用户是否有权访问指定服务（支持普通验证和安全Challenge验证）
          </p>
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
            <strong>注意：</strong> 此功能需要用户登录。如遇到 Network Error，请先前往登录页面登录。
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="normal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="normal">普通验证</TabsTrigger>
              <TabsTrigger value="secure">安全验证 (Challenge)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="normal" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">服务名称</label>
                <Input
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="例如: ocr-service, translate-service"
                  onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                />
              </div>

              <Button 
                onClick={handleValidate}
                disabled={validateMutation.isPending}
                className="w-full"
              >
                {validateMutation.isPending ? '验证中...' : '验证授权'}
              </Button>

              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <div className="text-red-600 text-sm">
                      <strong>错误:</strong> {error}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result && (
                <Card className={result.valid ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      验证结果
                      <Badge variant={result.valid ? "default" : "secondary"}>
                        {result.valid ? '有效' : '无效'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>服务名称:</strong> {result.service_name}
                      </div>
                      <div>
                        <strong>状态:</strong> {result.valid ? '有效' : '无效'}
                      </div>
                      {result.start_time && (
                        <div>
                          <strong>开始时间:</strong> {new Date(result.start_time).toLocaleString()}
                        </div>
                      )}
                      {result.end_time && (
                        <div>
                          <strong>结束时间:</strong> {new Date(result.end_time).toLocaleString()}
                        </div>
                      )}
                      {result.days_left !== undefined && (
                        <div>
                          <strong>剩余天数:</strong> 
                          <span className={result.days_left > 0 ? "text-green-600" : "text-red-600"}>
                            {result.days_left > 0 ? ` ${result.days_left} 天` : ` 已过期 ${Math.abs(result.days_left)} 天`}
                          </span>
                        </div>
                      )}
                    </div>
                    {result.message && (
                      <div className="mt-3 pt-3 border-t">
                        <strong>消息:</strong> {result.message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-sm">API 信息</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div><strong>接口:</strong> POST /api/v1/license/validate</div>
                  <div><strong>认证:</strong> 需要 Bearer Token</div>
                  <div><strong>请求体:</strong> {"{ service_name: string }"}</div>
                  <div><strong>响应:</strong> ValidateUserLicenseResponse</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="secure" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">服务名称</label>
                <Input
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="例如: ocr-service, translate-service"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Challenge值</label>
                <div className="flex gap-2">
                  <Input
                    value={challenge}
                    onChange={(e) => {
                      setChallenge(e.target.value)
                      if (e.target.value) {
                        setTimeout(parseExistingChallenge, 100)
                      }
                    }}
                    placeholder="输入Challenge字符串或点击生成"
                  />
                  <Button variant="outline" onClick={generateRandomChallenge}>
                    生成新的
                  </Button>
                  <Button variant="outline" onClick={generateExpiredChallenge}>
                    生成过期
                  </Button>
                </div>
              </div>

              {timestampInfo && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Challenge时间戳信息</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong>时间戳:</strong> {timestampInfo.timestamp}</div>
                      <div><strong>十六进制:</strong> {timestampInfo.timestampHex}</div>
                      <div><strong>生成时间:</strong> {timestampInfo.readableTime}</div>
                      <div>
                        <strong>年龄:</strong> 
                        <span className={timestampInfo.ageInSeconds > 300 ? "text-red-600" : "text-green-600"}>
                          {timestampInfo.ageInSeconds} 秒
                          {timestampInfo.ageInSeconds > 300 && " (已过期)"}
                        </span>
                      </div>
                      <div><strong>随机部分:</strong> {timestampInfo.randomPart}</div>
                      <div><strong>有效期:</strong> 5分钟 (300秒)</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                onClick={handleSecureValidate}
                className="w-full"
              >
                安全验证授权
              </Button>

              {secureError && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <div className="text-red-600 text-sm">
                      <strong>错误:</strong> {secureError}
                    </div>
                  </CardContent>
                </Card>
              )}

              {secureResult && (
                <Card className={secureResult.valid ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      安全验证结果
                      <Badge variant={secureResult.valid ? "default" : "secondary"}>
                        {secureResult.valid ? '有效' : '无效'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>服务名称:</strong> {secureResult.service_name}
                      </div>
                      <div>
                        <strong>状态:</strong> {secureResult.valid ? '有效' : '无效'}
                      </div>
                      {secureResult.start_time && (
                        <div>
                          <strong>开始时间:</strong> {new Date(secureResult.start_time).toLocaleString()}
                        </div>
                      )}
                      {secureResult.end_time && (
                        <div>
                          <strong>结束时间:</strong> {new Date(secureResult.end_time).toLocaleString()}
                        </div>
                      )}
                      {secureResult.days_left !== undefined && (
                        <div>
                          <strong>剩余天数:</strong> 
                          <span className={secureResult.days_left > 0 ? "text-green-600" : "text-red-600"}>
                            {secureResult.days_left > 0 ? ` ${secureResult.days_left} 天` : ` 已过期 ${Math.abs(secureResult.days_left)} 天`}
                          </span>
                        </div>
                      )}
                    </div>
                    {secureResult.message && (
                      <div className="mt-3 pt-3 border-t">
                        <strong>消息:</strong> {secureResult.message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {hashVerification && (
                <Card className={hashVerification.valid ? "border-blue-200 bg-blue-50" : "border-red-200 bg-red-50"}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      哈希验证
                      <Badge variant={hashVerification.valid ? "default" : "destructive"}>
                        {hashVerification.valid ? '通过' : '失败'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="grid gap-2">
                      <div>
                        <strong>Challenge:</strong> <code>{hashVerification.challenge}</code>
                      </div>
                      <div>
                        <strong>盐值 (转换后):</strong> <code>{hashVerification.salt}</code>
                      </div>
                      <div>
                        <strong>请求体:</strong> <code>{hashVerification.requestBody}</code>
                      </div>
                      <div>
                        <strong>响应体:</strong> <code className="break-all">{hashVerification.responseBody}</code>
                      </div>
                      <div>
                        <strong>服务器哈希:</strong> <code className="break-all">{hashVerification.received}</code>
                      </div>
                      <div>
                        <strong>计算哈希:</strong> <code className="break-all">{hashVerification.expected}</code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-sm">安全API信息</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div><strong>接口:</strong> POST /api/v1/license/validate-secure</div>
                  <div><strong>认证:</strong> 需要 Bearer Token</div>
                  <div><strong>请求头:</strong> X-Challenge (带时间戳)</div>
                  <div><strong>响应头:</strong> X-Response-Hash</div>
                  <div><strong>请求体:</strong> {"{ service_name: string }"}</div>
                  <div><strong>防篡改:</strong> 使用Challenge机制防止响应伪造</div>
                  <div><strong>防重放:</strong> 时间戳验证，5分钟有效期</div>
                  <div><strong>Challenge格式:</strong> timestamp_hex(8位) + random(24位)</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}