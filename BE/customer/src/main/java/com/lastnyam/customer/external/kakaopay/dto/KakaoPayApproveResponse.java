package com.lastnyam.customer.external.kakaopay.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class KakaoPayApproveResponse {

    @JsonProperty("aid")
    private String aid;

    @JsonProperty("tid")
    private String tid;

    @JsonProperty("cid")
    private String cid;

    @JsonProperty("sid")
    private String sid;

    @JsonProperty("partner_order_id")
    private String partnerOrderId;

    @JsonProperty("partner_user_id")
    private String partnerUserId;

    @JsonProperty("payment_method_type")
    private String paymentMethodType;

    @JsonProperty("amount")
    private Amount amount;

    @JsonProperty("card_info")
    private CardInfo cardInfo;

    @JsonProperty("item_name")
    private String itemName;

    @JsonProperty("item_code")
    private String itemCode;

    @JsonProperty("quantity")
    private Integer quantity;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("approved_at")
    private String approvedAt;

    @JsonProperty("payload")
    private String payload;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Amount {
        @JsonProperty("total")
        private Integer total;

        @JsonProperty("tax_free")
        private Integer taxFree;

        @JsonProperty("vat")
        private Integer vat;

        @JsonProperty("point")
        private Integer point;

        @JsonProperty("discount")
        private Integer discount;

        @JsonProperty("green_deposit")
        private Integer greenDeposit;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CardInfo {
        @JsonProperty("kakaopay_purchase_corp")
        private String kakaopayPurchaseCorp;

        @JsonProperty("kakaopay_purchase_corp_code")
        private String kakaopayPurchaseCorpCode;

        @JsonProperty("kakaopay_issuer_corp")
        private String kakaopayIssuerCorp;

        @JsonProperty("kakaopay_issuer_corp_code")
        private String kakaopayIssuerCorpCode;

        @JsonProperty("bin")
        private String bin;

        @JsonProperty("card_type")
        private String cardType;

        @JsonProperty("install_month")
        private String installMonth;

        @JsonProperty("approved_id")
        private String approvedId;

        @JsonProperty("card_mid")
        private String cardMid;

        @JsonProperty("interest_free_install")
        private String interestFreeInstall;

        @JsonProperty("installment_type")
        private String installmentType;

        @JsonProperty("card_item_code")
        private String cardItemCode;
    }
}

