package com.lastnyam.redis.service;

import java.time.Duration;
import java.util.List;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

@Service
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void add(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public Long incr(String key) {
        return redisTemplate.opsForValue().increment(key);
    }

    public void add(String key, Object value, Duration timeout) {
        redisTemplate.opsForValue().set(key, value, timeout);
    }

    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    public void delete(String key) {
        redisTemplate.delete(key);
    }

    public boolean exist(String key) {
        return redisTemplate.hasKey(key);
    }

    public List<Object> execute(RedisScript<List<Object>> script, List<String> keys, Object... args) {
        return redisTemplate.execute(script, keys, args);
    }

    public void removeRangeByScore(String key, int minBound, long maxBound) {
        ZSetOperations<String, Object> zSetOperations = redisTemplate.opsForZSet();
        zSetOperations.removeRangeByScore(key, minBound, maxBound);
    }

    public Long getCountFromZCard(String key) {
        ZSetOperations<String, Object> zSetOperations = redisTemplate.opsForZSet();
        return zSetOperations.zCard(key);
    }

    public void addZSet(String key, Integer userId, long now) {
        ZSetOperations<String, Object> zSetOperations = redisTemplate.opsForZSet();
        zSetOperations.add(key, userId, now);
    }
}
