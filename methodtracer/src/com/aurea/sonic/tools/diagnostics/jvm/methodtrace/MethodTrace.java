package com.aurea.sonic.tools.diagnostics.jvm.methodtrace;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;

import com.sun.jdi.AbsentInformationException;
import com.sun.jdi.BooleanValue;
import com.sun.jdi.StringReference;
import com.sun.jdi.ClassType;
import com.sun.jdi.Field;
import com.sun.jdi.IncompatibleThreadStateException;
import com.sun.jdi.LocalVariable;
import com.sun.jdi.Location;
import com.sun.jdi.Method;
import com.sun.jdi.ObjectReference;
import com.sun.jdi.ReferenceType;
import com.sun.jdi.StackFrame;
import com.sun.jdi.ThreadReference;
import com.sun.jdi.Value;
import com.sun.jdi.VirtualMachine;
import com.sun.jdi.event.BreakpointEvent;
import com.sun.jdi.event.ClassPrepareEvent;
import com.sun.jdi.event.Event;
import com.sun.jdi.event.EventQueue;
import com.sun.jdi.event.EventSet;
import com.sun.jdi.event.VMDeathEvent;
import com.sun.jdi.event.VMDisconnectEvent;
import com.sun.jdi.request.BreakpointRequest;
import com.sun.jdi.request.ClassPrepareRequest;
import com.sun.jdi.request.EventRequestManager;

public class MethodTrace {
	private static Hashtable<String, String> s_bptsHT = new Hashtable<String, String>();
	private static HashSet<String> s_classes = new HashSet<>();
	private static String bkptFile = "breakpoints.txt";

	private static PrintWriter s_pw = null;

	private static void debug(String s) {
		System.out.print(s);
		s_pw.print(s);
	}

	public static void main(String[] args) throws IOException,
			InterruptedException {
		String host = "localhost";
		int port = 7998;
		if (args.length > 0) {
			int colonidx = args[0].indexOf(":");
			if (colonidx != -1) {
				host = args[0].substring(0, colonidx);
				port = Integer.parseInt(args[0].substring(colonidx + 1));
			}
		}
		if (args.length > 1) {
			bkptFile = args[1];
		}
		FileReader fr = new FileReader(bkptFile);
		BufferedReader reader = new BufferedReader(fr);
		HashSet<String> bkpts = new HashSet<>();
		String line = reader.readLine();
		while (line != null) {
			bkpts.add(line);
			line = reader.readLine();
		}
		for (String bkpt : bkpts) {
			int colidx = bkpt.indexOf(":");
			if (colidx != -1)
				s_bptsHT.put(bkpt.substring(0, colidx),
						bkpt.substring(colidx + 1));
			else
				s_bptsHT.put(bkpt, "0");
		}
		Enumeration<String> keys = s_bptsHT.keys();
		String k;
		String classAndMethod;
		String classOnly;
		while (keys.hasMoreElements()) {
			k = keys.nextElement();
			classAndMethod = k.substring(0, k.indexOf('(') - 1);
			classOnly = classAndMethod.substring(0,
					classAndMethod.lastIndexOf('.'));
			s_classes.add(classOnly);
		}

		s_pw = new PrintWriter(new File("MethodTrace.out"));

		debug("Starting Method Watch:\n");
		VirtualMachine vm = new VMAcquirer().connect(host, port);

		// for pre-loaded classes establish...
		addBreakpoints(vm);

		// watch for loaded classes
		addClassWatch(vm);

		// resume the vm
		vm.resume();

		// process events
		EventQueue eventQueue = vm.eventQueue();
		while (true) {
			EventSet eventSet = eventQueue.remove();
			for (Event event : eventSet) {
				if (event instanceof VMDeathEvent
						|| event instanceof VMDisconnectEvent) {
					// exit
					return;
				} else if (event instanceof ClassPrepareEvent) {
					// watch field on loaded class
					ClassPrepareEvent classPrepEvent = (ClassPrepareEvent) event;
					addBreakpoints(classPrepEvent.referenceType(), vm);
				} else if (event instanceof BreakpointEvent) {
					boolean dump = false;
					BreakpointEvent bpEvt = (BreakpointEvent) event;
					ClassType targetClass = (ClassType) bpEvt.location()
							.declaringType();
					Method targetMethod = (Method) bpEvt.location().method();
					debug("\n----\n" + targetClass.name() + ":"
							+ targetMethod.name() + "\n");

					ThreadReference threadRef = bpEvt.thread();
					StackFrame stackFrame = null;
					List<LocalVariable> visVars = null;
					try {
						stackFrame = threadRef.frame(0);
						if (stackFrame != null)
							visVars = stackFrame.visibleVariables();
					} catch (IncompatibleThreadStateException e1) {
					} catch (AbsentInformationException e) {
					}
					if (visVars != null) {
						for (LocalVariable visibleVar : visVars) {
							Value val = stackFrame.getValue(visibleVar);
							debug(visibleVar.name() + "="
									+ (val == null ? "null" : val.toString()) + "\n");

						}
					}
					if (stackFrame != null) {
						List<Value> values = stackFrame.getArgumentValues();
						for (Value val : values) {
							dump = true;
							if (val instanceof BooleanValue) {
								debug(((BooleanValue) val).booleanValue() + ",");
							} else if (val instanceof StringReference) {
								StringReference or = (StringReference) val;
								debug(or.value() + ",");
							} else if (val instanceof ObjectReference) {
								ObjectReference or = (ObjectReference) val;
								List<Field> sFields = or.referenceType()
										.allFields();
								for (Field sField : sFields)
									if (sField.name().equals("file")
											|| sField.name().equals("path")) {
										debug(or.getValue(sField).toString()
												+ ",");
									}
							}
						}
						debug("\n----\n");

						if (dump) {
							try {
								List<StackFrame> fs = threadRef.frames();
								for (StackFrame f : fs) {
									debug(f.location().method().toString()+"\n");
								}
								debug("----\n\n");
							} catch (IncompatibleThreadStateException e) {
							}
						}
					}
				}
			}
			eventSet.resume();
		}
	}

	private static void addBreakpoints(ReferenceType referenceType,
			VirtualMachine vm) {
		List<Method> meths = referenceType.allMethods();
		for (Method meth : meths) {
			BreakpointRequest brF1 = null;
			String locn = s_bptsHT.get(meth.toString());
			if (locn == null || meth.location() == null)
				;
			else if (locn.equalsIgnoreCase("0")) {
				brF1 = vm.eventRequestManager().createBreakpointRequest(
						meth.location());

			} else {
				List<Location> locations = null;
				try {
					locations = meth.locationsOfLine(Integer.parseInt(locn)); // 1471
					if (locations.size() > 0)
						brF1 = vm.eventRequestManager()
								.createBreakpointRequest(locations.get(0));
				} catch (AbsentInformationException e) {
				}
			}
			if (brF1 != null)
				brF1.enable();
		}
	}

	private static void addClassWatch(VirtualMachine vm) {
		EventRequestManager erm = vm.eventRequestManager();
		for (String clz : s_classes) {
			ClassPrepareRequest classPrepareRequest = erm
					.createClassPrepareRequest();
			classPrepareRequest.addClassFilter(clz);
			classPrepareRequest.setEnabled(true);
		}
	}

	private static void addBreakpoints(VirtualMachine vm) {
		EventRequestManager erm = vm.eventRequestManager();
		for (String clz : s_classes) {
			for (ReferenceType rt : vm.classesByName(clz))
				addBreakpoints(rt, vm);
		}
	}
}