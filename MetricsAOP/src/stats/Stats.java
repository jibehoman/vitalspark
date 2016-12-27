package stats;

import com.sonicsw.mf.common.metrics.IMetricIdentity;
import com.sonicsw.mf.common.metrics.IMetricInfo;
import com.sonicsw.mf.common.metrics.IValueType;
import com.sonicsw.mf.common.metrics.MetricsFactory;
import com.sonicsw.mf.common.metrics.manager.IMetricsRegistrar;
import com.sonicsw.mf.common.metrics.manager.IStatistic;
import com.sonicsw.mf.common.metrics.manager.IStatisticProvider;
import com.sonicsw.mf.common.metrics.manager.StatisticsFactory;
import com.sonicsw.mf.framework.monitor.CollectionsMonitor;

public class Stats {
	// statistics
	private static volatile IStatistic s_bypassMonitorDatabaseStorageStatistic;
	private static volatile IStatistic s_elasticSearchStreamingStatistic;

	private static volatile IStatistic s_averageMetricLatencyStatistic;
	private static volatile IStatistic s_minMetricLatencyStatistic;
	private static volatile IStatistic s_maxMetricLatencyStatistic;
	private static volatile IStatistic s_metricsReceivedPerSecond;

	public static final com.sonicsw.mf.common.metrics.IMetricIdentity MONITOR_COLLECTOR_BYPASS_MONITOR_STORAGE_METRIC_ID = com.sonicsw.mf.common.metrics.MetricsFactory
			.createMetricIdentity(new String[] { "monitor", "collector",
					"bypassMonitorDatabaseStorage" });
	public static final com.sonicsw.mf.common.metrics.IMetricIdentity MONITOR_COLLECTOR_ELASTIC_SEARCH_STREAMING_METRIC_ID = com.sonicsw.mf.common.metrics.MetricsFactory
			.createMetricIdentity(new String[] { "monitor", "collector",
					"elasticSearchStreaming" });
	public static final com.sonicsw.mf.common.metrics.IMetricIdentity MONITOR_COLLECTOR_AVERAGE_METRICLATENCY_METRIC_ID = com.sonicsw.mf.common.metrics.MetricsFactory
			.createMetricIdentity(new String[] { "monitor", "collector",
					"averageMetricLatency" });
	public static final com.sonicsw.mf.common.metrics.IMetricIdentity MONITOR_COLLECTOR_MIN_METRICLATENCY_METRIC_ID = com.sonicsw.mf.common.metrics.MetricsFactory
			.createMetricIdentity(new String[] { "monitor", "collector",
					"minMetricLatency" });
	public static final com.sonicsw.mf.common.metrics.IMetricIdentity MONITOR_COLLECTOR_MAX_METRICLATENCY_METRIC_ID = com.sonicsw.mf.common.metrics.MetricsFactory
			.createMetricIdentity(new String[] { "monitor", "collector",
					"maxMetricLatency" });
	public static final com.sonicsw.mf.common.metrics.IMetricIdentity MONITOR_COLLECTOR_METRICS_PER_SECOND_METRIC_ID = com.sonicsw.mf.common.metrics.MetricsFactory
			.createMetricIdentity(new String[] { "monitor", "collector",
					"metricsPerSecond" });

	public static IMetricInfo[] getMetricsInfo() {
		// create the metrics for statistic interpretation
		IMetricInfo[] infos = new IMetricInfo[6];
		final boolean INSTANCE = true;
		final String extendedData = null;
		final boolean DYNAMIC = true; // permits runtime enablement
		final boolean LOWALERTS = true;
		final boolean HIGHALERTS = true;

		infos[0] = MetricsFactory
				.createMetricInfo(
						MONITOR_COLLECTOR_ELASTIC_SEARCH_STREAMING_METRIC_ID,
						IValueType.VALUE,
						"True/false value. Enable this metric to stream analytics engine directly.",
						extendedData, !INSTANCE, DYNAMIC, !HIGHALERTS,
						!LOWALERTS, "true(1)/false(0)");
		infos[1] = MetricsFactory
				.createMetricInfo(
						MONITOR_COLLECTOR_BYPASS_MONITOR_STORAGE_METRIC_ID,
						IValueType.VALUE,
						"True/false value. Enable this metric to bypass monitor storage.",
						extendedData, !INSTANCE, DYNAMIC, !HIGHALERTS,
						!LOWALERTS, "true(1)/false(0)");
		infos[2] = MetricsFactory
				.createMetricInfo(
						MONITOR_COLLECTOR_AVERAGE_METRICLATENCY_METRIC_ID,
						IValueType.AVERAGE,
						"Average latency in metrics reporting over collection interval.",
						extendedData, !INSTANCE, DYNAMIC, HIGHALERTS,
						!LOWALERTS, "milliseconds");
		infos[3] = MetricsFactory.createMetricInfo(
				MONITOR_COLLECTOR_MIN_METRICLATENCY_METRIC_ID,
				IValueType.MINIMUM,
				"Min latency in metrics  reporting over collection interval.",
				extendedData, !INSTANCE, DYNAMIC, !HIGHALERTS, !LOWALERTS,
				"millisecond");
		infos[4] = MetricsFactory.createMetricInfo(
				MONITOR_COLLECTOR_MAX_METRICLATENCY_METRIC_ID,
				IValueType.MAXIMUM,
				"Max latency in metrics  reporting over collection interval.",
				extendedData, !INSTANCE, DYNAMIC, HIGHALERTS, !LOWALERTS,
				"milliseconds");
		infos[5] = MetricsFactory.createMetricInfo(
				MONITOR_COLLECTOR_METRICS_PER_SECOND_METRIC_ID,
				IValueType.PER_SECOND_RATE,
				"Metrics per second  over collection interval.", extendedData,
				!INSTANCE, DYNAMIC, !HIGHALERTS, LOWALERTS, "per second");

		return infos;
	}

	/**
	 * Update connection instance statistic for messages received Called by
	 * AgentListener
	 */
	public static void onMetricReceived(long value) {
		if (s_averageMetricLatencyStatistic != null) {
			s_averageMetricLatencyStatistic.updateValue(value);
		}
		if (s_minMetricLatencyStatistic != null) {
			s_minMetricLatencyStatistic.updateValue(value);
		}
		if (s_maxMetricLatencyStatistic != null) {
			s_maxMetricLatencyStatistic.updateValue(value);
		}
		if (s_metricsReceivedPerSecond != null) {
			s_metricsReceivedPerSecond.updateValue(1);
		}
	}

	public static void enableMetrics(IMetricsRegistrar metricsRegistrar,
			IMetricIdentity[] ids) {
		final boolean INTERVAL_MODE = true; // statistic is offset by the value
											// at the start of the interval by
											// the last refresh value(reset)
		final short NO_HISTORY = 0;
		final short REFRESHED_VALUES_OVER_COLLECTION_INTERVAL_HISTORY = 1;
		final short REFRESHED_VALUES_AND_UPDATE_COUNTS_OVER_COLLECTION_INTERVAL_HISTORY = 2; // critical
																								// for
																								// precise
																								// collection
																								// interval
																								// averaging

		for (int i = 0; i < ids.length; i++) {
			if (ids[i].equals(MONITOR_COLLECTOR_BYPASS_MONITOR_STORAGE_METRIC_ID)
					&& s_bypassMonitorDatabaseStorageStatistic == null) {
				s_bypassMonitorDatabaseStorageStatistic = StatisticsFactory
						.createStatistic(IStatistic.VALUE_MODE, !INTERVAL_MODE,
								(IStatisticProvider[]) null, NO_HISTORY);
				metricsRegistrar.registerMetric(
						MONITOR_COLLECTOR_BYPASS_MONITOR_STORAGE_METRIC_ID,
						s_bypassMonitorDatabaseStorageStatistic);
			} else if (ids[i].equals(MONITOR_COLLECTOR_ELASTIC_SEARCH_STREAMING_METRIC_ID)
					&& s_elasticSearchStreamingStatistic == null) {
				s_elasticSearchStreamingStatistic = StatisticsFactory
						.createStatistic(IStatistic.VALUE_MODE, !INTERVAL_MODE,
								(IStatisticProvider[]) null, NO_HISTORY);
				metricsRegistrar.registerMetric(
						MONITOR_COLLECTOR_ELASTIC_SEARCH_STREAMING_METRIC_ID,
						s_elasticSearchStreamingStatistic);
			} else if (ids[i]
					.equals(MONITOR_COLLECTOR_AVERAGE_METRICLATENCY_METRIC_ID)
					&& s_averageMetricLatencyStatistic == null) {
				s_averageMetricLatencyStatistic = StatisticsFactory
						.createStatistic(IStatistic.COUNTER_MODE,
								INTERVAL_MODE, (IStatisticProvider[]) null,
								REFRESHED_VALUES_AND_UPDATE_COUNTS_OVER_COLLECTION_INTERVAL_HISTORY);
				metricsRegistrar.registerMetric(
						MONITOR_COLLECTOR_AVERAGE_METRICLATENCY_METRIC_ID,
						s_averageMetricLatencyStatistic);
			} else if (ids[i]
					.equals(MONITOR_COLLECTOR_MAX_METRICLATENCY_METRIC_ID)
					&& s_maxMetricLatencyStatistic == null) {
				s_maxMetricLatencyStatistic = StatisticsFactory
						.createStatistic(IStatistic.MAXIMUM_MODE,
								!INTERVAL_MODE, (IStatisticProvider[]) null,
								REFRESHED_VALUES_OVER_COLLECTION_INTERVAL_HISTORY);
				s_maxMetricLatencyStatistic.setInitialValue(0);
				metricsRegistrar
						.registerMetric(
								MONITOR_COLLECTOR_MAX_METRICLATENCY_METRIC_ID,
								s_maxMetricLatencyStatistic);
			} else if (ids[i]
					.equals(MONITOR_COLLECTOR_MIN_METRICLATENCY_METRIC_ID)
					&& s_minMetricLatencyStatistic == null) {
				s_minMetricLatencyStatistic = StatisticsFactory
						.createStatistic(IStatistic.MINIMUM_MODE,
								!INTERVAL_MODE, (IStatisticProvider[]) null,
								REFRESHED_VALUES_OVER_COLLECTION_INTERVAL_HISTORY);
				s_minMetricLatencyStatistic.setInitialValue(60000);
				metricsRegistrar
						.registerMetric(
								MONITOR_COLLECTOR_MIN_METRICLATENCY_METRIC_ID,
								s_minMetricLatencyStatistic);
			} 

			else if (ids[i]
					.equals(MONITOR_COLLECTOR_METRICS_PER_SECOND_METRIC_ID)
					&& s_metricsReceivedPerSecond == null) {
				s_metricsReceivedPerSecond = StatisticsFactory.createStatistic(
						IStatistic.COUNTER_MODE, INTERVAL_MODE,
						(IStatisticProvider[]) null,
						REFRESHED_VALUES_OVER_COLLECTION_INTERVAL_HISTORY);
				metricsRegistrar.registerMetric(
						MONITOR_COLLECTOR_METRICS_PER_SECOND_METRIC_ID,
						s_metricsReceivedPerSecond);
			}
		}
	}

	public static void disableMetrics(IMetricsRegistrar metricsRegistrar,
			IMetricIdentity[] ids) {
		for (int i = 0; i < ids.length; i++) {
			if (ids[i].equals(MONITOR_COLLECTOR_BYPASS_MONITOR_STORAGE_METRIC_ID)
					&& s_bypassMonitorDatabaseStorageStatistic != null) {
				metricsRegistrar.unregisterMetric(
						MONITOR_COLLECTOR_BYPASS_MONITOR_STORAGE_METRIC_ID,
						s_bypassMonitorDatabaseStorageStatistic);
				s_bypassMonitorDatabaseStorageStatistic = null;
			}  else if (ids[i].equals(MONITOR_COLLECTOR_ELASTIC_SEARCH_STREAMING_METRIC_ID)
					&& s_elasticSearchStreamingStatistic != null) {
				metricsRegistrar.unregisterMetric(
						MONITOR_COLLECTOR_ELASTIC_SEARCH_STREAMING_METRIC_ID,
						s_elasticSearchStreamingStatistic);
				s_elasticSearchStreamingStatistic = null;
			}  else if (ids[i]
					.equals(MONITOR_COLLECTOR_AVERAGE_METRICLATENCY_METRIC_ID)
					&& s_averageMetricLatencyStatistic != null) {
				metricsRegistrar
						.unregisterMetric(
								MONITOR_COLLECTOR_AVERAGE_METRICLATENCY_METRIC_ID,
								s_averageMetricLatencyStatistic);
				s_averageMetricLatencyStatistic = null;
			} else if (ids[i]
					.equals(MONITOR_COLLECTOR_MAX_METRICLATENCY_METRIC_ID)
					&& s_maxMetricLatencyStatistic != null) {
				metricsRegistrar
						.unregisterMetric(
								MONITOR_COLLECTOR_MAX_METRICLATENCY_METRIC_ID,
								s_maxMetricLatencyStatistic);
				s_maxMetricLatencyStatistic = null;
			} else if (ids[i]
					.equals(MONITOR_COLLECTOR_MIN_METRICLATENCY_METRIC_ID)
					&& s_minMetricLatencyStatistic != null) {
				metricsRegistrar
						.unregisterMetric(
								MONITOR_COLLECTOR_MIN_METRICLATENCY_METRIC_ID,
								s_minMetricLatencyStatistic);
				s_minMetricLatencyStatistic = null;
			} else if (ids[i]
					.equals(MONITOR_COLLECTOR_METRICS_PER_SECOND_METRIC_ID)
					&& s_metricsReceivedPerSecond != null) {
				metricsRegistrar.unregisterMetric(
						MONITOR_COLLECTOR_METRICS_PER_SECOND_METRIC_ID,
						s_metricsReceivedPerSecond);
				s_metricsReceivedPerSecond = null;
			}
		}
	}

	public static boolean streamAnalyticsStorageDirectly() {
		/* turn this dummy metric on to stream fast */
		return s_elasticSearchStreamingStatistic != null;
	}
	public static boolean bypassMonitorDatabaseStorage() {
		/* turn this dummy metric on to bypass storage */
		return s_bypassMonitorDatabaseStorageStatistic != null;
	}
}
