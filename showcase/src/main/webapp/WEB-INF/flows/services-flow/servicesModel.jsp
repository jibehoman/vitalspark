<div id="servicesFlow">
	<div class="span-13">
	<p class="notice">Select New Services</p>
	<form id="servicesModel" action="${flowExecutionUrl}" method="POST">
		<h:outputLabel>Select New Services(this is a <i><b>fraction</b></i> of what is out in the field): </h:outputLabel>
		<br/>
          <p>
          <b><i><font color="Red">Pick these new recommendations now!</font></i></b><br/>
              <input type="checkbox" name="softwareFeatures" value="UniversalRESTEnabler" checked/>Universal REST Enabler - REST Enable All Process</br>
              <input type="checkbox" name="softwareFeatures" value="ESBTraceRoute" checked/>ESBTraceRoute - Process Test Probe</br>
<br/> 
          <i><b>Technical picks</i></b><br/>
              <input type="checkbox" name="softwareFeatures" value="JSONConvert" />JSONConvert - JSON To XML Conversion</br>
              <input type="checkbox" name="softwareFeatures" value="CSVConvert" />CSVConvert - CSV To XML Conversion</br>
              <input type="checkbox" name="softwareFeatures" value="TimerService" />Timer Service - Process Scheduler</br>
              <input type="checkbox" name="softwareFeatures" value="POJOService" />POJO Service - ESB Annotations Support</br>
          <i><b>Enterprise Application on-ramps</i></b><br/>
              <input type="checkbox" name="softwareFeatures" value="FTPService" />FTP - FTP Client</br>
              <input type="checkbox" name="softwareFeatures" value="MailService" />Mail - Mail Client</br>
              <input type="checkbox" name="softwareFeatures" value="LDAPService" /><i>LDAP - LDAP Client <font color="Red">*1</font></i></br>
              <input type="checkbox" name="softwareFeatures" value="DBService" /><i>DB - DB Client <font color="Red">*1</font></i></br>
              <input type="checkbox" name="softwareFeatures" value="SOAPService" /><i>SC SOAP Client <font color="Red">*1</font></i></br>
            <i><b>Insurance Intelligence</i></b><br/>
              <input type="checkbox" name="softwareFeatures" value="ACORDSMAX" />ACORD Intelligence Module</br>
            <i><b>Telco Intelligence</i></b><br/>
              <input type="checkbox" name="softwareFeatures" value="SIDSMAX" />SID Intelligence Module</br>
            <i><b>Financial Services Intelligence</i></b><br/>
              <input type="checkbox" name="softwareFeatures" value="SWIFTSMAX" />SWIFT Intelligence Module</br>
            <i><b>Healthcare Intelligence</i></b><br/>
              <input type="checkbox" name="softwareFeatures" value="HL7SMAX" />HL7 Intelligence Module</br>          <p>
		<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<script type="text/javascript">
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'servicesModel',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'servicesModel',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'servicesModel',params:{fragments:"body"}}));
		</script>
		<br>&nbsp;</br><br>&nbsp;</br><b>Notes:</b><br>
          <font color="Red">*1</font> Deliberately including these examples as a source of the following <font color="Red">tensions</font>:
          <ul><li>LDAP Client, DB Client, and SOAP Client affirms transport integration but not the semantic integration(i.e. operations based on schema/ wsdl)
          <li>Semantic integration represents the bigger value(REST might be the one exception to this because of the HATEOS pattern of following links - that is why REST comes with a generic operation call)
          <li>Semantic integration is customer specific represented via schema/wsdl, or something on top
          <li>Because the itinerary experience of semantic service consumption is <i>customer specific</i>(e.g. consuming a DB table from a customer schema) 
          <i>the requirement that someone designs and publishes the "service" to the repository is going to arise almost
          immediately</i> In the case of, respectively,
          DXSI, SonicConnect, DBService it could be a direct hop from DXSI, SonicConnect, DBService Workbench Designer
          straight to the customer repository. There's obviously tooling changes needed here.
          <li>There is a "downside" to separation-of-concerns(i.e. service author vs itinerary author):
          <ul><li>The "service" is really a "proxy" to get access to other stuff
          <li>If the "itinerary" author wants to go straight to the source it is harder - Sonic Connect played big into
          "separation of concern" but then the field complained why can't I just DnD a WSDL like I used to be able to - so we put DnD back in.
          </ul>
          <li>It is worth noting that in terms of service creation when it comes to SOAP and DB Services we could make things a lot
          simpler. We'd do this by <i>taking away choices</i> - just have the designer point to the DB URL for schema, or WSDL for SOAP services,
          and automatically generate the services and give access to the itinerary author to <i>all</i> SOAP service and operations, and,
          for DB, all tables and views, say. More elaborate views of the data seems to belong to DXSI. According to BA,
          DXSI has a more powerful Database Service than the one Sonic ESB provides out of the box. 
          If that is the case that is an argument that we abandon Sonic Database Service entirely
          in favor of DXSI. The line seems to be that when you start augmenting the raw data-base 
          table operations with different views and derived values this is the time for DXSI to be 
          the choice. So SonicConnect, which just exposes all operations from a WSDL without
          elaboration, might not be the choice for DXSI. Whatever we do here it must be transparent
          to the itinerary author. A database service with operations appears as a database service
          which happens to be implemented by DXSI. Ditto for a web service and SonicConnect.
           <li>We have not mentioned AI yet. AI's access points should be browse-able from the repository. At first my reaction was "why is this different from the
          WSDL use case?". In fact Silvio had said that the distinction is that AI is accessed from the bus/DRA. We need to ponder this more, i.e. what it means 
          and are there any crazy(maybe not so crazy) ramifications
          here like "AI should be an ESB service not an MF Service".  
          <li>There is possibly a way we could have drag and drop and separation of concerns all at once. The experience might be to browse a 
          WSDL, select an operation, lookup the repository to see if the WSDL already exists, if it doesn't ask if you want to "load and lock" the WSDL into the
          repository. What is "load and locked" could have a Sonic Connect nature OR it could have a AI nature. In the AI case 
          we would under the covers... create the AIConnectService(Sonic Artifact) lock it in the repository... create the AI Access Group(AI Artifact)
          lock it in the repository(why not seems like a good place), and set the itinerary operation mapping. A sure-deciding factor
          when to create an AI nature would be if the WSDL had any WS-* annotations.
          <br><br>
          <a href="http://jira.aurea.local/browse/ESB-7484" target="_blank">feedback</a> very much appreciated here and on the overall page content in general! 
          <br><br>
          *2 The customer primary repository should focus on the ESB building blocks(services, itineraries)
          but there's nothing to stop us adding other stuff perhaps in secondary locations. Some examples:
          <ul>
          <li>Samples! I have a great sample to show REST and multi-part!, we constantly write stuff to show customers
          how to do things. Samples are interesting in the artifacts might be Workbench projects, or not.</li>
          <li>Andreas Geis's <a href="http://queuemanager.nl/download/" target="_blank">SonicMessageManager</a>(may need to license this?)</li>
          <li>Various utilities engineers may have stock-piled e.g. I have a remote debug method tracer, I'm sure everyone has their own gizmos</li>
          <li>An ESB Service that hosts a Spring/CXF/Jetty WAR engine. Believe it or not but (as I recall - and it goes back a few years)
          it actually goes as far as being able to execute .wars stored in the DS(potentially big ramifications). 
          Tread carefully though: we are NOT Tomcat so environmental dependencies sometimes can't be readily full-filled for any old 
          Web App.
          <li>Fragments of spring.xml that illustrate Active Directory or NTLM integration with Sonic Connect.
          <li>In summary, the really difficult stuff that we support architecturally but perhaps not formally expose:
          ESB interceptors(ESBTraceRoute is an example), Activate/Passivate, dynamic itinerary APIs
           - <a  style="color:red" href="http://wiki.aurea.local/display/soniceng/Dynamic+Itineraries+%28EMC%29">see
          if this would interest British Airways</a>(scroll to Fedex UC), the 
          Camel underpinning to Sonic Connect, etc, all seems eminently more harvest-able in a repository.
          To me there feels less risk for developers to put stuff out - of course there has to be controls, perhaps this
          kind of stuff appears in a different section from the sanctioned stuff.
          We need to think collectively and as individuals, what are the "hard" things that we do and have done in the past
          and for which we now have a better mechanism for sharing?
          <br><br>
          Take the ESBTraceRoute "featured" in this web-flow. Implemented as a ESB interceptor it could equally be implemented by
          a dynamic itinerary creation on the flow technique(and it may end up having to be!)
          <br><br> 
          Take, Passivate/Activate(the ability to suspend and persist an itineraries state and resume it later) - 
          I can almost design something right now along these lines: ESB interceptor
          introduces Passivate/Activate around a itinerary step, pre onMessage() call introduction saves the next step
          to be "resumption point"(we write the state to an endpoint called ReactivationQueue say(a JMS Queue)). Before passivation,
          the itinerary does a one-way WebService call, 
          the correlation magic what ever is is is seeded use a Web-Service Addressing(WSA) ReplyTo decoration. The itinerary passivates(incidentally passivate is implemented by the
          non-production to exit, fault rme - the post onMessage() call introduction removes them - that is the interceptor effectively "chokes" off 
          the itinerary from further execution for the time being. Hours, days whatever later an independent Reactivator WebService 
          receives the call-back and re-activates the itinerary. The "hard" stuff here that we've pushed to
          the repository are the Reactivator process, its SonicConnect expose service, and the interceptor. 
          The process architect is <i>unaware</i> of the passivation and activation and that has just taken place
          underneath him between the step call out to his WebService and the one that follows in the flow. This is NOT a generic solution
          because the callout/callback WebService is still customer specific, nonetheless, I think it illustrates the point.
          I would have to beg project management to include this cool stuff as part of a  formal product release -
          understandably that just would not happen! A better example might be calling a long running Savvion process from
          a Sonic itinerary. The itinerary activates the Savvion process along with correlation information.
          The Sonic itinerary then passivates itself. When Savvion completes, Savvion posts the Reactivator which 
          re-activates the Sonic itinerary.
          As a footnote, the example that I gave involving WSA, as I sense it, won Disney over. 
          </ul>
          <br>
          <a href="http://jira.aurea.local/browse/ESB-7485" target="_blank">share</a> with me other cool stuff</a>
           <br><br>
          *3 We haven't said anything about where the source and build for the artifacts is stored, and
          what publishing flows like. I think that we should hook into what the field is doing
          and use their Maven repo and plugins approach as the paradigm. 
           <br><br>
          *4 Needless to say, there are countless ways to expand here. The key is <i>giving the best experience possible</i>. At this point
          in the web-flow the customer is signed in, and has us connected to their system - we are fully aware of our customer.
          The set of choices we offer are honed to our's customer's environment, past history, and on and on.
      <br><br>     
          *5 There is almost something recursive going on here. It is obvious but worth 
          stating: thinking about a portal such as this helps us relate 
          to what our customers are trying to accomplish(build better experience). We are driving our own
          use-cases. 
      <br><br>     
          *6 This is exactly the
          place where you put a service "arcade", i.e. in addition to "select it" you have choices to "try it" first.  
      <br><br>     
          *7 Impact analysis - similar to "try it", the narrative might go: "were I to take it what is the impact to my applications?",
          "ans:here..", "can you suggest changes that I might be able to make to allow my application to accommodate that change?",
          "ans:here..", "looks good..  can you apply these changes to my system right now?", "ans:certainly, we notice that you 
          do not have 24x7 setup on your system, if you apply these changes you may experience a brief loss of service.
          would you like to upgrade to 24x7 now?" and goes on and on and on(<i>ref:Moneyball</i>). 
           </p><p></br><b>Miscellaneous Questions:</b><br>
		  *1 For MQ folks, ESBTraceRoute is an experimental intercepter that has potential in the 
		  area of sending test-probes through arbitrary paths in the bus. Is there a facility to send 
		  Sonic JMS messages in an "executive" mode that is not subject to flow control? Flow-control is one challenge I am
		  sure there are others.
		  </p>
	</form>
	</div>
	<!--
	<div class="span-6 last">
	<div style="margin-left: 1em;">
		<h6>services Model</h6>
		<p>Mediate and on-ramp services to your application by a number of mechanisms.<p>
	</div>
	-->
	</div>
</div>