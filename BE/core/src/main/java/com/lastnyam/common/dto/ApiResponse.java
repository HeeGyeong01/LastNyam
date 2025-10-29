package com.lastnyam.common.dto;

import com.lastnyam.common.enums.ApiStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T>{

    private T data;
    private ApiStatus status;
    private int code;
    private String message;


    public static <T> ApiResponse<T> ofSuccess(T data, String message){
        return new ApiResponse<>(data,ApiStatus.SUCCESS,0,message);
    }

    public static <T> ApiResponse<T> ofFail(int code, String message){
        return new ApiResponse<>(null,ApiStatus.FAIL,code,message);
    }

    public static <T> ApiResponse<T> ofError(int code, String message){
        return new ApiResponse<>(null,ApiStatus.ERROR,code,message);
    }
}
