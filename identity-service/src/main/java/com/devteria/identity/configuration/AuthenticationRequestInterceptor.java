package com.devteria.identity.configuration;

import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AuthenticationRequestInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes servletRequestAttributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (servletRequestAttributes != null) {
            // Có request context
            var request = servletRequestAttributes.getRequest();
            var authHeader = request.getHeader("Authorization");

            if (StringUtils.hasText(authHeader)) {
                template.header("Authorization", authHeader);
            }
        } else {
            if (template.url().contains("/internal/")) {
                log.info("Calling internal endpoint without auth token");
            }
        }
    }
}
