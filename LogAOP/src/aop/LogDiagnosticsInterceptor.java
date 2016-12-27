package aop;

import java.text.DateFormat;
import java.util.Collection;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Vector;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;

import com.sonicsw.mf.common.metrics.IMetric;
import com.sonicsw.mf.common.metrics.IMetricsData;
import com.sonicsw.mf.common.runtime.IContainerState;
import com.sonicsw.mf.jmx.client.MFNotification;

import progress.message.broker.EOFEvent;
import progress.message.broker.EOLEvent;
import progress.message.broker.GetInDoubtTransactions;
import progress.message.broker.GuarMsgEvt;
import progress.message.broker.LogEvent;
import progress.message.broker.QueueMsgEvt;
import progress.message.broker.QueueMsgSendEvt;
import progress.message.msg.IMgram;
import progress.message.zclient.ISidebandData;
import progress.message.zclient.ISubject;

public class LogDiagnosticsInterceptor {
	private static long earliestTimestamp = Long.MAX_VALUE;
	private static long latestTimestamp = 0;
	private static Hashtable<String, Long> mfOps = new Hashtable<String, Long>();
	private static Hashtable<String, Long> mfCallers = new Hashtable<String, Long>();
	private static String biggestMFCaller = null;
	private static long biggestMFCallerCount = 0;
	private static byte[] raw;
	private static Hashtable<String, Long> mfMetrics = new Hashtable<String, Long>();

	public static void before(Object me, String method)
	{
		System.out.println("[before]"+method);
	}
	public static void afterMain(String[] args ) {
        java.util.Date dt = new java.util.Date(earliestTimestamp);
		StringBuffer supplement = new StringBuffer();
		supplement.append("Earliest timestamp:"+new java.text.SimpleDateFormat("dd.MM.yy HH_mm_ss.SSS").format(dt) + "\n");
        dt = new java.util.Date(latestTimestamp);
		supplement.append("Latest timestamp:"+new java.text.SimpleDateFormat("dd.MM.yy HH_mm_ss.SSS").format(dt) + "\n");
		supplement.append("Total ops:" + totalMfOps() + "\n");
		supplement.append(mfOps + "\n");
		supplement.append("Total callers:" + totalMFCallers() + "\n");
		supplement.append(mfCallers + "\n");
		supplement.append("Biggest caller:"+biggestMFCaller+" count:" + biggestMFCallerCount + "\n");
		supplement.append("Total metrics:" + totalMFMetrics() + "\n");
		supplement.append(mfMetrics + "\n");
		supplement.append("\n");
		System.out.print(supplement);		
	}
	
	public static void afterOnLogEventRead(LogEvent evt, long lastloc, long nextSeqNum )
	{
		StringBuffer supplement  = new StringBuffer("[afterOnLogEventRead]\n");
		IMgram m = null;
		ISidebandData sb = null;
		ISubject subject = null;
		if (evt instanceof GuarMsgEvt) {
			m = ((GuarMsgEvt) evt).getMessage();
		} else if (evt instanceof QueueMsgEvt) {
			m = ((QueueMsgEvt) evt).getMessage();
		} 
		if (m != null) {
			sb = m.getSidebandData();
			subject = m.getSubject();
			raw = m.getRawBody();
		}
		if (sb != null) {
			long timestamp = sb.getTimestamp();
			if (timestamp != 0 && timestamp < earliestTimestamp)
				earliestTimestamp = timestamp;
			else if (timestamp > latestTimestamp)
				latestTimestamp = timestamp;
	        java.util.Date dt = new java.util.Date(timestamp);
	        String df = new java.text.SimpleDateFormat("dd.MM.yy HH_mm_ss.SSS").format(dt);
			supplement.append(df + " ");
			supplement.append("subject:" + subject + "\n" );
			Hashtable ht = sb.getProperties();
			supplement.append(ht.toString() + "\n");
			if (ht.containsKey("JMS_SonicMQ_mf_operation")) {
				String op = (String)ht.get("JMS_SonicMQ_mf_operation");
				countOperation(op);
				if ((op.equals("invoke")) && raw != null) {
					supplement.append("invoke Operation:" + getInvokeOperation(raw) + " from " + ht.get("JMSXUserID") + "@" + ht.get("JMS_SonicMQ_mf_reply_subject") + " at " + df + "\n");
				} else if (op.equals("handleNotification") && raw != null) {
					supplement.append("Raw Body length " + raw.length + "\n" + getNotification(raw) + "\n");					
				} else if (op.equals("getElement") && raw != null) {
					if (raw.length == 1 && (raw[0] == 1))
						supplement.append("Raw Body length " + raw.length + "\nNo Element returned to caller " + subject + "\n");
					else {
						supplement.append("getElement Operation:" + getElement(raw) + " at " + df + "\n");
					}
					
				} else if (op.equals("getCollectiveState") && raw != null) {
					if (raw.length == 1 && (raw[0] == 1))
						supplement.append("Raw Body length " + raw.length + "\nNo State returned to caller " + subject + "\n");
					else
						supplement.append("Raw Body length " + raw.length + "\n" +  getCollectiveState(raw) + "\n");
					
				} else if (op.equals("getMetricsData") && raw != null) {
					if (raw.length == 1 && (raw[0] == 1))
						supplement.append("Raw Body length " + raw.length + "\nNo Metrics returned to caller " + subject + "\n");
					else
						supplement.append("Raw Body length " + raw.length + "\n" +  getMetricsData(raw) + "\n");
					
				} else if (raw != null) {
					supplement.append("Raw Body length " + raw.length + "\n" + op + "\n");
				}
			} else if (raw != null) {
				supplement.append("Non-operation Raw Body length " + raw.length + "\n");
			}
			if (ht.containsKey("JMS_SonicMQ_mf_reply_subject")) {
				countMFCallers((String)ht.get("JMS_SonicMQ_mf_reply_subject"));
			}			

		}
		if (evt instanceof EOFEvent || evt instanceof EOLEvent) {
	        java.util.Date dt = new java.util.Date(earliestTimestamp);
			supplement.append("Earliest timestamp:"+new java.text.SimpleDateFormat("dd.MM.yy HH_mm_ss.SSS").format(dt) + "\n");
	        dt = new java.util.Date(latestTimestamp);
			supplement.append("Latest timestamp:"+new java.text.SimpleDateFormat("dd.MM.yy HH_mm_ss.SSS").format(dt) + "\n");
			supplement.append("Total ops:" + totalMfOps() + "\n");
			supplement.append(mfOps + "\n");
			supplement.append("Total ops:" + totalMFCallers() + "\n");
			supplement.append(mfCallers + "\n");
			supplement.append("Biggest caller:"+biggestMFCaller+" count:" + biggestMFCallerCount);
			supplement.append("Total metrics:" + totalMFMetrics() + "\n");
			supplement.append(mfMetrics + "\n");
		}
		supplement.append("\n");
		System.out.print(supplement);
	}
	private static String getMetricsData(byte[] b) {
		try {
			java.io.ByteArrayInputStream arrayIn = new java.io.ByteArrayInputStream(
					b, 5, b.length -5);
			ObjectInputStream in = new java.io.ObjectInputStream(arrayIn);
			IMetricsData data = (IMetricsData) in.readObject();
			in.close();
			IMetric[] md = data.getMetrics();
			String pattern = "";
			for (int i=0; i<md.length; i++) {
				pattern = md[i].getMetricIdentity().getName();
				countMetric(pattern);
			}
			return "Metrics reported:"+ md.length +  " " + pattern;
		} catch (Throwable e) {
			// TODO Auto-generated catch block
			return "CANNOT DECODE";
		}	
    }
	private static long totalMfOps() {
		long result = 0;
		Enumeration<Long> e = mfOps.elements();
		while (e.hasMoreElements()) {
			result += e.nextElement().longValue();
		}
		return result;
	}
	private static void countMetric(String metric) {
		if (metric.startsWith("queue.messages.Count")) {
			metric = "queue.messages.Count";
		} else if (metric.startsWith("esb.service.listeners.RefreshIntervalMaxActive")) {
			metric = "esb.service.listeners.RefreshIntervalMaxActive";
		}
		if (mfMetrics.containsKey(metric)) {
			Long l = mfMetrics.get(metric);
			mfMetrics.put(metric, new Long(l.longValue() + 1));
			
		} else {
			mfMetrics.put(metric, new Long(1));
		}
		
	}
	private static long totalMFMetrics() {
		long result = 0;
		Enumeration<Long> e = mfMetrics.elements();
		while (e.hasMoreElements()) {
			result += e.nextElement().longValue();
		}
		return result;
	}
	private static void countOperation(String op) {
		if (mfOps.containsKey(op)) {
			Long l = mfOps.get(op);
			mfOps.put(op, new Long(l.longValue() + 1));
			
		} else {
			mfOps.put(op, new Long(1));
		}
		
	}
	private static long totalMFCallers() {
		long result = 0;
		Enumeration<Long> e = mfCallers.elements();
		while (e.hasMoreElements()) {
			result += e.nextElement().longValue();
		}
		return result;
	}
	private static void countMFCallers(String reply) {
		if (mfCallers.containsKey(reply)) {
			Long l = mfCallers.get(reply);
			mfCallers.put(reply, new Long(l.longValue() + 1));

			
		} else {
			mfCallers.put(reply, new Long(1));
		}
		long l = mfCallers.get(reply).longValue();
		if (l > biggestMFCallerCount) {
			biggestMFCallerCount = l;
			biggestMFCaller = reply;
		}		
	}
	private static String getCollectiveState(byte[] b) {
		try {
			java.io.ByteArrayInputStream arrayIn = new java.io.ByteArrayInputStream(
					b, 5, b.length -5);
			ObjectInputStream in = new java.io.ObjectInputStream(arrayIn);
			IContainerState[] states = (IContainerState[]) in.readObject();
			in.close();
			return "CollectiveState for "+ states.length + " containers.";
		} catch (Throwable e) {
			// TODO Auto-generated catch block
			return "CANNOT DECODE";
		}
	}
	private static String getInvokeOperation(byte[] b) {
		Object[] o = decodeConnectorServerBytes(b);
	    return (String)o[1];
	}

	private static Object[] decodeConnectorServerBytes(byte[] b) {
		try {
			java.io.ByteArrayInputStream arrayIn = new java.io.ByteArrayInputStream(
					b, 5, b.length -5);
			ObjectInputStream in = new java.io.ObjectInputStream(arrayIn);
			String[] signature = (String[]) in.readObject();
			Object[] params = (Object[]) in.readObject();
			in.close();
			return params;
		} catch (Throwable e) {
			// TODO Auto-generated catch block
			return new String[] {"CANNOT DECODE", "CANNOT DECODE"};
		}
	}
	private static String getNotification(byte[] b) {
		String o = decodeNotificationBytes(b);
	    return o;
	}
	private static String getElement(byte[] b) {
		Object p[] = decodeConnectorServerBytes(b);
	    return "caller:"+ (String)p[0] + "   entry:" +  (String)p[1];
	}
	private static String decodeNotificationBytes(byte[] b) {
		try {
			java.io.ByteArrayInputStream arrayIn = new java.io.ByteArrayInputStream(
					b, 5, b.length -5);
			ObjectInputStream in = new java.io.ObjectInputStream(arrayIn);
			String[] signature = (String[]) in.readObject();
			Object[]  params = (Object[])in.readObject();
			MFNotification  notification = (MFNotification)params[0];
			//Object callback = in.readObject();
			in.close();
			return notification.getEventName() + " from " +  notification.getSourceIdentity().getCanonicalName();
		} catch (Throwable e) {
			// TODO Auto-generated catch block
			return "CANNOT DECODE";
		}
	}

}
