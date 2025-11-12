package com.lastnyam.customer.external.kakaopay.store;

import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class KakaoPayTempStore {

	private final ConcurrentHashMap<String, String> partnerOrderIdToTid = new ConcurrentHashMap<>();

	public void put(String partnerOrderId, String tid) {
		partnerOrderIdToTid.put(partnerOrderId, tid);
	}

	public String get(String partnerOrderId) {
		return partnerOrderIdToTid.get(partnerOrderId);
	}

	public void remove(String partnerOrderId) {
		partnerOrderIdToTid.remove(partnerOrderId);
	}
}


