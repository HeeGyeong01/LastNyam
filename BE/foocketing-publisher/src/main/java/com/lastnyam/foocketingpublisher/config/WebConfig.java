package com.lastnyam.foocketingpublisher.config;

import com.lastnyam.foocketingpublisher.interceptor.JwtAuthenticationInterceptor;
import com.lastnyam.foocketingpublisher.resolver.UserIdArgumentResolver;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 설정 (Interceptor 및 ArgumentResolver 등록)
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final JwtAuthenticationInterceptor jwtAuthenticationInterceptor;
    private final UserIdArgumentResolver userIdArgumentResolver;

//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(jwtAuthenticationInterceptor)
//                .addPathPatterns("/api/**");
//    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(userIdArgumentResolver);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowCredentials(true)
                .allowedHeaders("*")
                .allowedMethods("POST", "OPTIONS")
                .allowedOrigins("http://localhost:5173", "https://lastnyam.co.kr")
                .maxAge(3000);
    }
}

