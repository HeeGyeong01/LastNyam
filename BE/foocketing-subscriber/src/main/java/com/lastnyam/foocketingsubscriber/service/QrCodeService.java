package com.lastnyam.foocketingsubscriber.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * QR 코드 생성 서비스
 */
@Slf4j
@Service
public class QrCodeService {

    private static final int QR_CODE_WIDTH = 300;
    private static final int QR_CODE_HEIGHT = 300;
    private static final String IMAGE_FORMAT = "PNG";

    /**
     * URL을 포함하는 QR 코드 이미지를 생성합니다.
     *
     * @param url QR 코드에 포함할 URL
     * @return PNG 형식의 QR 코드 이미지 바이트 배열
     * @throws RuntimeException QR 코드 생성 실패 시
     */
    public byte[] generateQrCode(String url) {
        log.info("QR 코드 생성 시작 - URL: {}", url);

        try {
            // QR 코드 생성 옵션 설정
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);

            // QR 코드 매트릭스 생성
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(
                    url,
                    BarcodeFormat.QR_CODE,
                    QR_CODE_WIDTH,
                    QR_CODE_HEIGHT,
                    hints);

            // BitMatrix를 이미지로 변환하여 바이트 배열로 출력
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, IMAGE_FORMAT, outputStream);
            byte[] qrCodeData = outputStream.toByteArray();

            log.info("QR 코드 생성 완료 - 크기: {} bytes", qrCodeData.length);
            return qrCodeData;

        } catch (WriterException e) {
            log.error("QR 코드 인코딩 실패: {}", e.getMessage(), e);
            throw new RuntimeException("QR 코드 생성 중 오류가 발생했습니다.", e);
        } catch (IOException e) {
            log.error("QR 코드 이미지 변환 실패: {}", e.getMessage(), e);
            throw new RuntimeException("QR 코드 이미지 생성 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 트랜잭션 ID를 기반으로 QR 코드 파일명을 생성합니다.
     *
     * @param transactionId   트랜잭션 ID
     * @param transactionType 트랜잭션 타입 (discount 또는 foocketing)
     * @return QR 코드 파일명
     */
    public String generateQrCodeFileName(Integer transactionId, String transactionType) {
        return String.format("qr-%s-%d-%d.png",
                transactionType.toLowerCase(),
                transactionId,
                System.currentTimeMillis());
    }
}
