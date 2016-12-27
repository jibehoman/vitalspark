/*
 * Generated by the Jasper component of Apache Tomcat
 * Version: Apache Tomcat/7.0.37
 * Generated at: 2016-03-30 21:26:11 UTC
 * Note: The last modified time of this file was set to
 *       the last modified time of the source file after
 *       generation to assist with modification tracking.
 */
package org.apache.jsp.WEB_002dINF.flows.commission_002dflow;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;

public final class accessModel_jsp extends org.apache.jasper.runtime.HttpJspBase
    implements org.apache.jasper.runtime.JspSourceDependent {

  private static final javax.servlet.jsp.JspFactory _jspxFactory =
          javax.servlet.jsp.JspFactory.getDefaultFactory();

  private static java.util.Map<java.lang.String,java.lang.Long> _jspx_dependants;

  private javax.el.ExpressionFactory _el_expressionfactory;
  private org.apache.tomcat.InstanceManager _jsp_instancemanager;

  public java.util.Map<java.lang.String,java.lang.Long> getDependants() {
    return _jspx_dependants;
  }

  public void _jspInit() {
    _el_expressionfactory = _jspxFactory.getJspApplicationContext(getServletConfig().getServletContext()).getExpressionFactory();
    _jsp_instancemanager = org.apache.jasper.runtime.InstanceManagerFactory.getInstanceManager(getServletConfig());
  }

  public void _jspDestroy() {
  }

  public void _jspService(final javax.servlet.http.HttpServletRequest request, final javax.servlet.http.HttpServletResponse response)
        throws java.io.IOException, javax.servlet.ServletException {

    final javax.servlet.jsp.PageContext pageContext;
    javax.servlet.http.HttpSession session = null;
    final javax.servlet.ServletContext application;
    final javax.servlet.ServletConfig config;
    javax.servlet.jsp.JspWriter out = null;
    final java.lang.Object page = this;
    javax.servlet.jsp.JspWriter _jspx_out = null;
    javax.servlet.jsp.PageContext _jspx_page_context = null;


    try {
      response.setContentType("text/html");
      pageContext = _jspxFactory.getPageContext(this, request, response,
      			null, true, 8192, true);
      _jspx_page_context = pageContext;
      application = pageContext.getServletContext();
      config = pageContext.getServletConfig();
      session = pageContext.getSession();
      out = pageContext.getOut();
      _jspx_out = out;

      out.write("<div id=\"commissionFlow\">\n");
      out.write("\t<div class=\"span-7\">\n");
      out.write("\t<p class=\"notice\">Select Access Model</p>\n");
      out.write("\t<form id=\"accessModel\" action=\"");
      out.write((java.lang.String) org.apache.jasper.runtime.PageContextImpl.proprietaryEvaluate("${flowExecutionUrl}", java.lang.String.class, (javax.servlet.jsp.PageContext)_jspx_page_context, null, false));
      out.write("\" method=\"POST\">\n");
      out.write("\t\t<h:outputLabel>Select Access Mediation Features: </h:outputLabel>\n");
      out.write("\t\t<br/>\n");
      out.write("          <p>\n");
      out.write("              <input type=\"checkbox\" name=\"mediationFeatures\" value=\"Inbound SOAP_1.1\" />Expose applications as SOAP_1.1</br>\n");
      out.write("              <input type=\"checkbox\" name=\"mediationFeatures\" value=\"Inbound SOAP_1.2\" />Expose applications as SOAP_1.2</br>\n");
      out.write("              <input type=\"checkbox\" name=\"mediationFeatures\" value=\"Inbound REST\" />Expose applications as REST_1.1</br>\n");
      out.write("          </p>\n");
      out.write("\t\t<button id=\"previous\" type=\"submit\" name=\"_eventId_previous\">Previous &lt;&lt;</button>\n");
      out.write("\t\t<button id=\"next\" type=\"submit\" name=\"_eventId_next\">Next &gt;&gt;</button>\n");
      out.write("\t\t<button id=\"cancel\" type=\"submit\" name=\"_eventId_cancel\">Cancel</button>\n");
      out.write("\t\t<script type=\"text/javascript\">\n");
      out.write("\t\t\tSpring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'accessModel',params:{fragments:\"body\"}}));\n");
      out.write("\t\t\tSpring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'accessModel',params:{fragments:\"body\"}}));\n");
      out.write("\t\t\tSpring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'accessModel',params:{fragments:\"body\"}}));\n");
      out.write("\t\t</script>\n");
      out.write("\t</form>\n");
      out.write("\t</div>\n");
      out.write("\t<div class=\"span-6 last\">\n");
      out.write("\t<div style=\"margin-left: 1em;\">\n");
      out.write("\t\t<h6>Access Model</h6>\n");
      out.write("\t\t<p>Mediate and on-ramp access to your application by a number of mechanisms.<p>\n");
      out.write("\t\t<br><br><b>Notes</b>:\n");
      out.write("\t\t<br>\n");
      out.write("\t\tD Kibble writes: &quot;Where are we with REST support? ... I&apos;d like to try to change that position and see when how we could start to expose REST interfaces to the SIP2 hosted services. &quot; \n");
      out.write("\t\t <br><br>\n");
      out.write("\t\tWhat does Dave mean by this? <br><br>\n");
      out.write("\t\tIs he just asking for Sonic processes to be RESTfully exposed. Is he complaining about the current AI mechanism which is, politely, &quot;difficult&quot;?\n");
      out.write("\t\tDoes he want JSON support if so how? Does he expect to consume REST? Are we talking about simple single XML or JSON request/responses or multi-part MIME? \n");
      out.write("\t\t<br/><br/>\n");
      out.write("\t\tWe could implement this : a canonical way for ESB messages to be generically exposed by REST, where, MIME parts become ESB parts, query parameters become ESB headers.\n");
      out.write("\t</div>\n");
      out.write("\t</div>\n");
      out.write("</div>");
    } catch (java.lang.Throwable t) {
      if (!(t instanceof javax.servlet.jsp.SkipPageException)){
        out = _jspx_out;
        if (out != null && out.getBufferSize() != 0)
          try { out.clearBuffer(); } catch (java.io.IOException e) {}
        if (_jspx_page_context != null) _jspx_page_context.handlePageException(t);
        else throw new ServletException(t);
      }
    } finally {
      _jspxFactory.releasePageContext(_jspx_page_context);
    }
  }
}
