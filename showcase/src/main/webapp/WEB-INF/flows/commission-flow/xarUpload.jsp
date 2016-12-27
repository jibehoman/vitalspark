<div id="commissionFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Upload application archive</p>
	<!-- Do not supply an id parameter it does not post the multipart -->
	<form method="post" action="${flowExecutionUrl}" enctype="multipart/form-data">
	   <div>
       <div class="span-4">	
		 <h:outputLabel>Select XAR: </h:outputLabel>
       </div>
       <div class="span-7 last">
	    <input type="file" accept=".xar" name="file"/>
       </div>
       </div>
		<button id="upload" type="submit" name="_eventId_upload">Upload</button>
		<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<script type="text/javascript">
		    Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'upload',event:'onclick',formId:'xarUpload',params:{fragments:"body"}}));
		    Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'xarUpload',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'xarUpload',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'xarUpload',params:{fragments:"body"}}));
		</script>
	</form>
</div>
</div>