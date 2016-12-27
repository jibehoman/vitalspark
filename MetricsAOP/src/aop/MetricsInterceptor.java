package aop;

import java.util.HashSet;

import stats.Stats;

import com.sonicsw.mf.common.metrics.IHistoricalMetric;
import com.sonicsw.mf.common.metrics.IMetricIdentity;
import com.sonicsw.mf.common.metrics.IMetricInfo;
import com.sonicsw.mf.common.metrics.manager.IMetricsRegistrar;

public class MetricsInterceptor {

	public static  void beforeenableMetrics(IMetricsRegistrar r, IMetricIdentity[] ids) {
		Stats.enableMetrics(r, ids);
	}
	public static  void beforedisableMetrics(IMetricsRegistrar r, IMetricIdentity[] ids) {
		Stats.disableMetrics(r, ids);
	}
	public static  IMetricInfo[] wrapgetMetricsInfo() {
		return Stats.getMetricsInfo();
	}	
	public static void beforeformatHistoricalMetric(IHistoricalMetric metric) {
        long time = System.currentTimeMillis() ;
		Stats.onMetricReceived(time - metric.getCurrencyTimestamp());
	}
	public static void  wrapenableMetrics(String component, HashSet metrics) {
		System.out.println("Bypass");
		
	}


}
