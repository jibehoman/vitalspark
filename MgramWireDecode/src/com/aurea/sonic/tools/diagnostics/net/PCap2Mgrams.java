package com.aurea.sonic.tools.diagnostics.net;

import java.io.FileInputStream;

import progress.message.zclient.xonce.MgramTrace;
import progress.message.zclient.SessionConfig;

import java.io.IOException;
import java.util.Enumeration;

import progress.message.msg.IMgram;
import progress.message.zclient.EMgramFormatError;
import progress.message.zclient.EMgramVersionMismatch;
import progress.message.zclient.ISubjectFilter;
public class PCap2Mgrams {
	public PCap2Mgrams() {}
	public static void main(String[] args) throws EMgramVersionMismatch, IOException, EMgramFormatError {
		SessionConfig.IN_BROKER = true;
		
		FileInputStream is = new FileInputStream(args[0]);
		IMgram m;
		IMgram m2;
		int i = 0;
		while (true) {
			try {
				m = (new progress.message.msg.v26.MgramCreator()).createMgram(is);
				i+=1;
				System.out.println("Loaded primary mgram " + i);
				diagnose("", m);
		        if ( m.supportsOperationHandle() && m.getOperationHandle() != null && m.getOperationHandle().getMgramList() != null) {
		                  m2 = (IMgram)m.getOperationHandle().getMgramList().getFirst() ;
		  				  System.out.println("        Inner mgram ");
		  				  diagnose("        ", m2);
		        }
			} catch (java.io.EOFException e) {
				System.out.println("End of data!");
				break;						
			} catch (Exception e) {
				System.out.println(e);
				break;				
			}
		}
	}
	private static void diagnose(String indent, IMgram m) {
		  System.out.println(indent+m);
		  System.out.println(MgramTrace.diagnosticString(indent, null, m));
		  if  (m.getBrokerHandle().getSubjectFilters() != null) {
			Enumeration<ISubjectFilter> e = m.getBrokerHandle().getSubjectFilters().elements();
			while (e.hasMoreElements()) {
				System.out.println(e.nextElement());
			}
		  }
		
	}

}
