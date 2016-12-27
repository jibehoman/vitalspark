<div id="commissionFlow">
	<div class="span-7">
	<p class="notice">Select Access Model</p>
	<form id="accessModel" action="${flowExecutionUrl}" method="POST">
		<h:outputLabel>Select Access Mediation Features: </h:outputLabel>
		<br/>
          <p>
              <input type="checkbox" name="mediationFeatures" value="Inbound SOAP_1.1" />Expose applications as SOAP_1.1</br>
              <input type="checkbox" name="mediationFeatures" value="Inbound SOAP_1.2" />Expose applications as SOAP_1.2</br>
              <input type="checkbox" name="mediationFeatures" value="Inbound REST" />Expose applications as REST_1.1</br>
          </p>
		<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<script type="text/javascript">
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'accessModel',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'accessModel',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'accessModel',params:{fragments:"body"}}));
		</script>
	</form>
	</div>
	<div class="span-6 last">
	<div style="margin-left: 1em;">
		<h6>Access Model</h6>
		<p>Mediate and on-ramp access to your application by a number of mechanisms.<p>
		<br><br><b>Notes</b>:
		<br>
		D Kibble writes: &quot;Where are we with REST support? ... I&apos;d like to try to change that position and see when how we could start to expose REST interfaces to the SIP2 hosted services. &quot; 
		 <br><br>
		What does Dave mean by this? <br><br>
		Is he just asking for Sonic processes to be RESTfully exposed. Is he complaining about the current AI mechanism which is, politely, &quot;difficult&quot;?
		Does he want JSON support if so how? Does he expect to consume REST? Are we talking about simple single XML or JSON request/responses or multi-part MIME? 
		<br/><br/>
		We could implement this : a canonical way for ESB messages to be generically exposed by REST, where, MIME parts become ESB parts, query parameters become ESB headers.
	</div>
	</div>
</div>