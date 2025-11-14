import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

export default function KakaoCallback() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const login = useAuthStore((state) => state.login)

	useEffect(() => {
		const accessToken = searchParams.get('accessToken')
		const refreshToken = searchParams.get('refreshToken')
		const userId = searchParams.get('userId')
		const error = searchParams.get('error')

		if (error) {
			// 카카오 로그인 에러 처리
			console.error('카카오 로그인 에러:', error)
			// 부모 창에 에러 메시지 전송
			if (window.opener) {
				window.opener.postMessage({ type: 'KAKAO_LOGIN_ERROR', error }, window.location.origin)
				window.close()
			} else {
				// 팝업이 아닌 경우 로그인 페이지로 리디렉트
				navigate('/login')
			}
			return
		}

		// 백엔드에서 직접 토큰을 전달
		if (accessToken && refreshToken && userId) {
			// Store에 로그인 정보 저장 (내부적으로 localStorage도 함께 저장)
			const userIdNum = parseInt(userId, 10)
			login(accessToken, refreshToken, userIdNum)

			// 부모 창에 성공 메시지 전송 (팝업인 경우)
			if (window.opener) {
				window.opener.postMessage(
					{ type: 'KAKAO_LOGIN_SUCCESS', accessToken, refreshToken, userId },
					window.location.origin
				)
				window.close()
			} else {
				// 팝업이 아닌 경우 홈으로 리디렉트
				navigate('/')
			}
			return
		}
	}, [searchParams, navigate, login])

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center">
				<h2 className="text-xl font-semibold mb-4">로그인 중...</h2>
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
			</div>
		</div>
	)
}
