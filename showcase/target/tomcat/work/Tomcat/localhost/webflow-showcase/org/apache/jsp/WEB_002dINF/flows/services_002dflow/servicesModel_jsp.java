/*
 * Generated by the Jasper component of Apache Tomcat
 * Version: Apache Tomcat/7.0.37
 * Generated at: 2016-03-30 21:27:51 UTC
 * Note: The last modified time of this file was set to
 *       the last modified time of the source file after
 *       generation to assist with modification tracking.
 */
package org.apache.jsp.WEB_002dINF.flows.services_002dflow;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;

public final class servicesModel_jsp extends org.apache.jasper.runtime.HttpJspBase
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

      out.write("<div id=\"servicesFlow\">\n");
      out.write("\t<div class=\"span-13\">\n");
      out.write("\t<p class=\"notice\">Select New Services</p>\n");
      out.write("\t<form id=\"servicesModel\" action=\"");
      out.write((java.lang.String) org.apache.jasper.runtime.PageContextImpl.proprietaryEvaluate("${flowExecutionUrl}", java.lang.String.class, (javax.servlet.jsp.PageContext)_jspx_page_context, null, false));
      out.write("\" method=\"POST\">\n");
      out.write("\t\t<h:outputLabel>Select New Services(this is a <i><b>fraction</b></i> of what is out in the field): </h:outputLabel>\n");
      out.write("\t\t<br/>\n");
      out.write("          <p>\n");
      out.write("          <b><i><font color=\"Red\">Pick these new recommendations now!</font></i></b><br/>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"UniversalRESTEnabler\" checked/>Universal REST Enabler - REST Enable All Process</br>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"ESBTraceRoute\" checked/>ESBTraceRoute - Process Test Probe</br>\n");
      out.write("<br/> \n");
      out.write("          <i><b>Technical picks</i></b><br/>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"JSONConvert\" />JSONConvert - JSON To XML Conversion</br>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"CSVConvert\" />CSVConvert - CSV To XML Conversion</br>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"TimerService\" />Timer Service - Process Scheduler</br>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"POJOService\" />POJO Service - ESB Annotations Support</br>\n");
      out.write("          <i><b>Enterprise Application on-ramps</i></b><br/>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"FTPService\" />FTP - FTP Client</br>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"MailService\" />Mail - Mail Client</br>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"LDAPService\" /><i>LDAP - LDAP Client <font color=\"Red\">*1</font></i></br>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"DBService\" /><i>DB - DB Client <font color=\"Red\">*1</font></i></br>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"SOAPService\" /><i>SC SOAP Client <font color=\"Red\">*1</font></i></br>\n");
      out.write("            <i><b>Insurance Intelligence</i></b><br/>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"ACORDSMAX\" />ACORD Intelligence Module</br>\n");
      out.write("            <i><b>Telco Intelligence</i></b><br/>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"SIDSMAX\" />SID Intelligence Module</br>\n");
      out.write("            <i><b>Financial Services Intelligence</i></b><br/>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"SWIFTSMAX\" />SWIFT Intelligence Module</br>\n");
      out.write("            <i><b>Healthcare Intelligence</i></b><br/>\n");
      out.write("              <input type=\"checkbox\" name=\"softwareFeatures\" value=\"HL7SMAX\" />HL7 Intelligence Module</br>          <p>\n");
      out.write("\t\t<button id=\"previous\" type=\"submit\" name=\"_eventId_previous\">Previous &lt;&lt;</button>\n");
      out.write("\t\t<button id=\"next\" type=\"submit\" name=\"_eventId_next\">Next &gt;&gt;</button>\n");
      out.write("\t\t<button id=\"cancel\" type=\"submit\" name=\"_eventId_cancel\">Cancel</button>\n");
      out.write("\t\t<script type=\"text/javascript\">\n");
      out.write("\t\t\tSpring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'servicesModel',params:{fragments:\"body\"}}));\n");
      out.write("\t\t\tSpring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'servicesModel',params:{fragments:\"body\"}}));\n");
      out.write("\t\t\tSpring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'servicesModel',params:{fragments:\"body\"}}));\n");
      out.write("\t\t</script>\n");
      out.write("\t\t<br>&nbsp;</br><br>&nbsp;</br><b>Notes:</b><br>\n");
      out.write("          <font color=\"Red\">*1</font> Deliberately including these examples as a source of the following <font color=\"Red\">tensions</font>:\n");
      out.write("          <ul><li>LDAP Client, DB Client, and SOAP Client affirms transport integration but not the semantic integration(i.e. operations based on schema/ wsdl)\n");
      out.write("          <li>Semantic integration represents the bigger value(REST might be the one exception to this because of the HATEOS pattern of following links - that is why REST comes with a generic operation call)\n");
      out.write("          <li>Semantic integration is customer specific represented via schema/wsdl, or something on top\n");
      out.write("          <li>Because the itinerary experience of semantic service consumption is <i>customer specific</i>(e.g. consuming a DB table from a customer schema) \n");
      out.write("          <i>the requirement that someone designs and publishes the \"service\" to the repository is going to arise almost\n");
      out.write("          immediately</i> In the case of, respectively,\n");
      out.write("          DXSI, SonicConnect, DBService it could be a direct hop from DXSI, SonicConnect, DBService Workbench Designer\n");
      out.write("          straight to the customer repository. There's obviously tooling changes needed here.\n");
      out.write("          <li>There is a \"downside\" to separation-of-concerns(i.e. service author vs itinerary author):\n");
      out.write("          <ul><li>The \"service\" is really a \"proxy\" to get access to other stuff\n");
      out.write("          <li>If the \"itinerary\" author wants to go straight to the source it is harder - Sonic Connect played big into\n");
      out.write("          \"separation of concern\" but then the field complained why can't I just DnD a WSDL like I used to be able to - so we put DnD back in.\n");
      out.write("          </ul>\n");
      out.write("          <li>It is worth noting that in terms of service creation when it comes to SOAP and DB Services we could make things a lot\n");
      out.write("          simpler. We'd do this by <i>taking away choices</i> - just have the designer point to the DB URL for schema, or WSDL for SOAP services,\n");
      out.write("          and automatically generate the services and give access to the itinerary author to <i>all</i> SOAP service and operations, and,\n");
      out.write("          for DB, all tables and views, say. More elaborate views of the data seems to belong to DXSI. According to BA,\n");
      out.write("          DXSI has a more powerful Database Service than the one Sonic ESB provides out of the box. \n");
      out.write("          If that is the case that is an argument that we abandon Sonic Database Service entirely\n");
      out.write("          in favor of DXSI. The line seems to be that when you start augmenting the raw data-base \n");
      out.write("          table operations with different views and derived values this is the time for DXSI to be \n");
      out.write("          the choice. So SonicConnect, which just exposes all operations from a WSDL without\n");
      out.write("          elaboration, might not be the choice for DXSI. Whatever we do here it must be transparent\n");
      out.write("          to the itinerary author. A database service with operations appears as a database service\n");
      out.write("          which happens to be implemented by DXSI. Ditto for a web service and SonicConnect.\n");
      out.write("           <li>We have not mentioned AI yet. AI's access points should be browse-able from the repository. At first my reaction was \"why is this different from the\n");
      out.write("          WSDL use case?\". In fact Silvio had said that the distinction is that AI is accessed from the bus/DRA. We need to ponder this more, i.e. what it means \n");
      out.write("          and are there any crazy(maybe not so crazy) ramifications\n");
      out.write("          here like \"AI should be an ESB service not an MF Service\".  \n");
      out.write("          <li>There is possibly a way we could have drag and drop and separation of concerns all at once. The experience might be to browse a \n");
      out.write("          WSDL, select an operation, lookup the repository to see if the WSDL already exists, if it doesn't ask if you want to \"load and lock\" the WSDL into the\n");
      out.write("          repository. What is \"load and locked\" could have a Sonic Connect nature OR it could have a AI nature. In the AI case \n");
      out.write("          we would under the covers... create the AIConnectService(Sonic Artifact) lock it in the repository... create the AI Access Group(AI Artifact)\n");
      out.write("          lock it in the repository(why not seems like a good place), and set the itinerary operation mapping. A sure-deciding factor\n");
      out.write("          when to create an AI nature would be if the WSDL had any WS-* annotations.\n");
      out.write("          <br><br>\n");
      out.write("          <a href=\"http://jira.aurea.local/browse/ESB-7484\" target=\"_blank\">feedback</a> very much appreciated here and on the overall page content in general! \n");
      out.write("          <br><br>\n");
      out.write("          *2 The customer primary repository should focus on the ESB building blocks(services, itineraries)\n");
      out.write("          but there's nothing to stop us adding other stuff perhaps in secondary locations. Some examples:\n");
      out.write("          <ul>\n");
      out.write("          <li>Samples! I have a great sample to show REST and multi-part!, we constantly write stuff to show customers\n");
      out.write("          how to do things. Samples are interesting in the artifacts might be Workbench projects, or not.</li>\n");
      out.write("          <li>Andreas Geis's <a href=\"http://queuemanager.nl/download/\" target=\"_blank\">SonicMessageManager</a>(may need to license this?)</li>\n");
      out.write("          <li>Various utilities engineers may have stock-piled e.g. I have a remote debug method tracer, I'm sure everyone has their own gizmos</li>\n");
      out.write("          <li>An ESB Service that hosts a Spring/CXF/Jetty WAR engine. Believe it or not but (as I recall - and it goes back a few years)\n");
      out.write("          it actually goes as far as being able to execute .wars stored in the DS(potentially big ramifications). \n");
      out.write("          Tread carefully though: we are NOT Tomcat so environmental dependencies sometimes can't be readily full-filled for any old \n");
      out.write("          Web App.\n");
      out.write("          <li>Fragments of spring.xml that illustrate Active Directory or NTLM integration with Sonic Connect.\n");
      out.write("          <li>In summary, the really difficult stuff that we support architecturally but perhaps not formally expose:\n");
      out.write("          ESB interceptors(ESBTraceRoute is an example), Activate/Passivate, dynamic itinerary APIs\n");
      out.write("           - <a  style=\"color:red\" href=\"http://wiki.aurea.local/display/soniceng/Dynamic+Itineraries+%28EMC%29\">see\n");
      out.write("          if this would interest British Airways</a>(scroll to Fedex UC), the \n");
      out.write("          Camel underpinning to Sonic Connect, etc, all seems eminently more harvest-able in a repository.\n");
      out.write("          To me there feels less risk for developers to put stuff out - of course there has to be controls, perhaps this\n");
      out.write("          kind of stuff appears in a different section from the sanctioned stuff.\n");
      out.write("          We need to think collectively and as individuals, what are the \"hard\" things that we do and have done in the past\n");
      out.write("          and for which we now have a better mechanism for sharing?\n");
      out.write("          <br><br>\n");
      out.write("          Take the ESBTraceRoute \"featured\" in this web-flow. Implemented as a ESB interceptor it could equally be implemented by\n");
      out.write("          a dynamic itinerary creation on the flow technique(and it may end up having to be!)\n");
      out.write("          <br><br> \n");
      out.write("          Take, Passivate/Activate(the ability to suspend and persist an itineraries state and resume it later) - \n");
      out.write("          I can almost design something right now along these lines: ESB interceptor\n");
      out.write("          introduces Passivate/Activate around a itinerary step, pre onMessage() call introduction saves the next step\n");
      out.write("          to be \"resumption point\"(we write the state to an endpoint called ReactivationQueue say(a JMS Queue)). Before passivation,\n");
      out.write("          the itinerary does a one-way WebService call, \n");
      out.write("          the correlation magic what ever is is is seeded use a Web-Service Addressing(WSA) ReplyTo decoration. The itinerary passivates(incidentally passivate is implemented by the\n");
      out.write("          non-production to exit, fault rme - the post onMessage() call introduction removes them - that is the interceptor effectively \"chokes\" off \n");
      out.write("          the itinerary from further execution for the time being. Hours, days whatever later an independent Reactivator WebService \n");
      out.write("          receives the call-back and re-activates the itinerary. The \"hard\" stuff here that we've pushed to\n");
      out.write("          the repository are the Reactivator process, its SonicConnect expose service, and the interceptor. \n");
      out.write("          The process architect is <i>unaware</i> of the passivation and activation and that has just taken place\n");
      out.write("          underneath him between the step call out to his WebService and the one that follows in the flow. This is NOT a generic solution\n");
      out.write("          because the callout/callback WebService is still customer specific, nonetheless, I think it illustrates the point.\n");
      out.write("          I would have to beg project management to include this cool stuff as part of a  formal product release -\n");
      out.write("          understandably that just would not happen! A better example might be calling a long running Savvion process from\n");
      out.write("          a Sonic itinerary. The itinerary activates the Savvion process along with correlation information.\n");
      out.write("          The Sonic itinerary then passivates itself. When Savvion completes, Savvion posts the Reactivator which \n");
      out.write("          re-activates the Sonic itinerary.\n");
      out.write("          As a footnote, the example that I gave involving WSA, as I sense it, won Disney over. \n");
      out.write("          </ul>\n");
      out.write("          <br>\n");
      out.write("          <a href=\"http://jira.aurea.local/browse/ESB-7485\" target=\"_blank\">share</a> with me other cool stuff</a>\n");
      out.write("           <br><br>\n");
      out.write("          *3 We haven't said anything about where the source and build for the artifacts is stored, and\n");
      out.write("          what publishing flows like. I think that we should hook into what the field is doing\n");
      out.write("          and use their Maven repo and plugins approach as the paradigm. \n");
      out.write("           <br><br>\n");
      out.write("          *4 Needless to say, there are countless ways to expand here. The key is <i>giving the best experience possible</i>. At this point\n");
      out.write("          in the web-flow the customer is signed in, and has us connected to their system - we are fully aware of our customer.\n");
      out.write("          The set of choices we offer are honed to our's customer's environment, past history, and on and on.\n");
      out.write("      <br><br>     \n");
      out.write("          *5 There is almost something recursive going on here. It is obvious but worth \n");
      out.write("          stating: thinking about a portal such as this helps us relate \n");
      out.write("          to what our customers are trying to accomplish(build better experience). We are driving our own\n");
      out.write("          use-cases. \n");
      out.write("      <br><br>     \n");
      out.write("          *6 This is exactly the\n");
      out.write("          place where you put a service \"arcade\", i.e. in addition to \"select it\" you have choices to \"try it\" first.  \n");
      out.write("      <br><br>     \n");
      out.write("          *7 Impact analysis - similar to \"try it\", the narrative might go: \"were I to take it what is the impact to my applications?\",\n");
      out.write("          \"ans:here..\", \"can you suggest changes that I might be able to make to allow my application to accommodate that change?\",\n");
      out.write("          \"ans:here..\", \"looks good..  can you apply these changes to my system right now?\", \"ans:certainly, we notice that you \n");
      out.write("          do not have 24x7 setup on your system, if you apply these changes you may experience a brief loss of service.\n");
      out.write("          would you like to upgrade to 24x7 now?\" and goes on and on and on(<i>ref:Moneyball</i>). \n");
      out.write("           </p><p></br><b>Miscellaneous Questions:</b><br>\n");
      out.write("\t\t  *1 For MQ folks, ESBTraceRoute is an experimental intercepter that has potential in the \n");
      out.write("\t\t  area of sending test-probes through arbitrary paths in the bus. Is there a facility to send \n");
      out.write("\t\t  Sonic JMS messages in an \"executive\" mode that is not subject to flow control? Flow-control is one challenge I am\n");
      out.write("\t\t  sure there are others.\n");
      out.write("\t\t  </p>\n");
      out.write("\t</form>\n");
      out.write("\t</div>\n");
      out.write("\t<!--\n");
      out.write("\t<div class=\"span-6 last\">\n");
      out.write("\t<div style=\"margin-left: 1em;\">\n");
      out.write("\t\t<h6>services Model</h6>\n");
      out.write("\t\t<p>Mediate and on-ramp services to your application by a number of mechanisms.<p>\n");
      out.write("\t</div>\n");
      out.write("\t-->\n");
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