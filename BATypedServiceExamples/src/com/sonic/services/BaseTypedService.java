package com.sonic.services;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

import com.sonicsw.esb.service.common.SFCInitializationContext;
import com.sonicsw.esb.service.common.SFCServiceContext;
import com.sonicsw.esb.service.common.impl.AbstractSFCServiceImpl;
import com.sonicsw.esb.process.mapping.InvocationContext;
import com.sonicsw.esb.process.mapping.ParameterValue;
import com.sonicsw.esb.process.mapping.ParameterValueCollection;
import com.sonicsw.esb.process.mapping.ParameterValueHolder;
import com.sonicsw.esb.process.mapping.ParameterValueMap;
import com.sonicsw.xq.XQConstants;
import com.sonicsw.xq.XQEnvelope;
import com.sonicsw.xq.XQLog;
import com.sonicsw.xq.XQParameters;
import com.sonicsw.xq.XQServiceContext;
import com.sonicsw.xq.XQServiceException;

public class BaseTypedService extends AbstractSFCServiceImpl {

	// This is the XQLog (the container's logging mechanism).
	private XQLog m_xqLog = null;

	/**
	 * Constructor for a MyTypedService
	 */
	public BaseTypedService() {
	}

	@Override
	public void doInit(SFCInitializationContext initializationContext)
			throws XQServiceException {
		super.doInit(initializationContext);
		m_xqLog = initializationContext.getXQInitContext().getLog();
	}

	public final void doService(final SFCServiceContext ctx,
			final XQEnvelope envelope) throws XQServiceException {
		m_xqLog.logDebug("Service processing...");
		XQServiceContext xqServiceContext = ctx.getXQServiceContext();

		XQParameters params = xqServiceContext.getParameters();
		String method = params.getParameter("operationId",
				XQConstants.PARAM_STRING);
		if (method.indexOf(".") != -1)
			method = method.substring(method.indexOf(".")+1);
		Method m = locateMethod(method);
		InvocationContext invCtx = (InvocationContext) xqServiceContext
				.getInvocationContext();
		ParameterValueMap inputParams = invCtx.getInputParameterValues();
		ParameterValueMap outputParams = invCtx.getOutputParameterValues();
		Iterator<ParameterValue> pvit = inputParams.getParameterValues();
		Vector v = new Vector();
		while (pvit.hasNext()) {
			v.add(pvit.next().getValue());
		}
		Object result;
		try {
			result = m.invoke(this, v.toArray());
		} catch (Exception e) {
			throw new XQServiceException(e);
		}
		if (result == null) {
		} else if (!(result instanceof Object[])) {
			outputParams.getParameterValues().next().setValue(result);
		} else {
			List<ParameterValueHolder> pvc = toPVH((Object[]) result);
			outputParams.getParameterValue("collection")
					.setValue(pvc);
			outputParams.getParameterValue("stringCollection")
			.setValue(toPV((Object[]) result));
		}
		ctx.addOutgoing(envelope);
		m_xqLog.logDebug("Service processed...");
	}

	private List<ParameterValueHolder> toPVH(Object[] result) {
		List<ParameterValueHolder> alPVH = new ArrayList<ParameterValueHolder>();
		for (int i = 0; i < result.length; i++) {
			ParameterValueHolder param = new ParameterValueHolder("collection" + i,
					"xsd:anyType", result[i]);
			param.setContentType("text/plain");
			alPVH.add(param);
		}
		return alPVH;
	}
	private List<Object> toPV(Object[] result) {
		ArrayList<Object> alPV = new ArrayList<Object>();
		for (int i = 0; i < result.length; i++) {
			alPV.add(result[i]);
		}
		return alPV;
	}

	private java.lang.reflect.Method locateMethod(String method) {
		java.lang.reflect.Method[] m = this.getClass().getMethods();
		for (int i = 0; i < m.length; i++)
			if (m[i].getName().equals(method))
				return m[i];
		return null;
	}

}