/*
 * Generated by the Jasper component of Apache Tomcat
 * Version: Apache Tomcat/7.0.37
 * Generated at: 2016-03-30 21:25:48 UTC
 * Note: The last modified time of this file was set to
 *       the last modified time of the source file after
 *       generation to assist with modification tracking.
 */
package org.apache.jsp.WEB_002dINF.flows.commission_002dflow;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;

public final class applicationType_jsp extends org.apache.jasper.runtime.HttpJspBase
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

      out.write("<div id=\"commissionFlow\" xmlns:h=\"http://java.sun.com/jsf/html\">\n");
      out.write("\t<div class=\"span-7\">\n");
      out.write("\t<p class=\"notice\">Select Aurea application type to commission</p>\n");
      out.write("\t<form id=\"applicationType\" action=\"");
      out.write((java.lang.String) org.apache.jasper.runtime.PageContextImpl.proprietaryEvaluate("${flowExecutionUrl}", java.lang.String.class, (javax.servlet.jsp.PageContext)_jspx_page_context, null, false));
      out.write("\" method=\"POST\">\n");
      out.write("\t\t<h:outputLabel>Application Type</h:outputLabel>\n");
      out.write("        <select name=\"applicationType\" value=\"");
      out.write((java.lang.String) org.apache.jasper.runtime.PageContextImpl.proprietaryEvaluate("${commission.applicationType}", java.lang.String.class, (javax.servlet.jsp.PageContext)_jspx_page_context, null, false));
      out.write("\">\n");
      out.write("                                <option value=\"Sonic\">Sonic</option>\n");
      out.write("                                <option value=\"Savvion\">Savvion</option>\n");
      out.write("                            </select><br/>\n");
      out.write("\t\t<button id=\"cancel\" type=\"submit\" name=\"_eventId_cancel\">Cancel</button>\n");
      out.write("\t\t<button id=\"next\" type=\"submit\" name=\"_eventId_next\">Next &gt;&gt;</button>\n");
      out.write("\t\t<script type=\"text/javascript\">\n");
      out.write("            Spring.addDecoration(new Spring.ValidateAllDecoration({elementId:'next', event:'onclick'}));\n");
      out.write("\t\t\tSpring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'applicationType',params:{fragments:\"body\"}}));\n");
      out.write("\t\t\tSpring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'applicationType',params:{fragments:\"body\"}}));\n");
      out.write("\t\t</script>\n");
      out.write("\t</form>\n");
      out.write("\t</div>\n");
      out.write("\t<div class=\"span-6 last\">\n");
      out.write("\t<div style=\"margin-left: 1em;\">\n");
      out.write("\t\t<h6>Application Type</h6>\n");
      out.write("\t\t<p>Sonic is currently supported.<p>\n");
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
