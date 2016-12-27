<div id="commissionFlow">
	<div class="span-7">
		<p class="notice">Select Monitoring Model</p>
	<form id="monitoringModel" action="${flowExecutionUrl}" method="POST">
		<h:outputLabel>Select Monitoring Features: </h:outputLabel>
		<br/>
          <p>
              <input type="checkbox" name="monitoringFeatures" value="AMS" />Subscribe To Aurea Monitoring Service</br>
          </p>
		<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<script type="text/javascript">
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'monitoringModel',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'monitoringModel',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'monitoringModel',params:{fragments:"body"}}));
		</script>
	</form>
	</div>
	<div class="span-6 last">
	<div style="margin-left: 1em;">
		<h6>Monitoring Model</h6>
		<p>Enable monitoring features.<p>
		<br/>
		Aurea Monitoring Service provides a comprehensive set of tools and capabilities for
		monitoring your applications. 
		<br/><br/>You may operate this service yourself, or, sign up
		to the service on a <i>subscription basis</i>. When you sign up on a subscription basis
		Aurea experts will take care of monitoring and system maintenance for you, leaving you free to focus
		on what matters the most - running your business. 
	</div>
	</div>
</div>