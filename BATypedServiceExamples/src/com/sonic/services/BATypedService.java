package com.sonic.services;

public class BATypedService extends BaseTypedService{
	/** all of the BA services are highly runtime parameterized - what part to take parameters from
	 * what part to insert etc. There are about 3-4 services that the new Transform now takes care of
	 * BASE64 encoder etc, header manipulators
	 */
	/**
	 * Issues to resolve: ParameterValueMap could be ordered for argument marshalling
	 * No binary ContentType returned
	 * ParameterValueHolder ContentType determination from Java or do we just not use this?
	 * Multiple outputs fixed number > 1 but not collection style.
	 */
	public String regexpreplace(String candidate, String regexp) {
		return "replacement";
		
	}
	public String propertyFileToXML(String file) {
		return "<somexml/>";		
	}
	public String[] ldapQuery(String p1, String p2, String p3 ) {
		return new String[]{p1,p2,p3};
		
	}}
