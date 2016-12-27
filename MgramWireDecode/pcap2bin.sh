set -xv

# Utility to take wireshark pcap and to re-construct binary traffic
#
# Wireshark UI should be used to triage and filter the data(e.g. tcp.dstport == 54871) then save the filtered
# data as pcap. Alternatively filters can be specified here.
#
filter="tcp.dstport == 54871 and tcp.srcport == 26100 and frame > 5000"

# extract options and their arguments into variables.
while true ; do
    case "$1" in
        --pcap|-p)  shift ; pcap=$1 ; shift ;;
        --filter|-f)  shift ; filter=$1 ; shift ;;
        --last|-l)  shift ; last=$1 ; shift ;;
        --help|-h) echo "Usage:pcap2bin --pcap pcapfile [--filter pcap display filter]" ; exit 1 ;;
	*) break ;; 
    esac
done

if [ "$pcap" == "" ] ; then
   echo "Usage:pcap2bin --pcap pcapfile [--filter pcap display filter]"
   exit 1 
fi;

umask 777
pcapbase=`basename $pcap | cut -d'.' -f 1`
rm -rf "$pcapbase.editcap" "$pcapbase.raw" "$pcapbase.selectedmgrams" "$pcapbase.0blanks" "$pcapbase.refined" "$pcapbase.bin"
# Run the filter for user data packets
editcap -D 10000 "$pcap" "$pcapbase.editcap"
tshark -r "$pcapbase.editcap" -Y "$filter" -T fields -e data > "$pcapbase.raw"
if [ $? != 0 ] ; then
  exit $?
fi;

y=0
if [ "$last" != "" ] ; then
 # Trim to the last n mgrams - assumes aligns with TCP packet
 x=`grep -n  "^1a" "$pcapbase.raw" | tail -$last | head -1 | cut -d: -f 1`
 y=`expr $x - 1`
else
  # Delete up to the first Mgram packet - assumes aligns with TCP packet
  x=`grep -n  "^1a" "$pcapbase.raw" | head -1 | cut -d: -f 1`
  y=`expr $x - 1`
fi
if [ "$y" != "0" ] ; then
  sed -e "1,`echo $y`d" "$pcapbase.raw" > "$pcapbase.selectedmgrams"
else
  cp "$pcapbase.raw" "$pcapbase.selectedmgrams"
fi
# Remove blank lines
sed -e "/^\$/d" "$pcapbase.selectedmgrams" > "$pcapbase.0blanks"
# Join lines
tr -d '\n' < "$pcapbase.0blanks" > "$pcapbase.refined"
# Generate binary
xxd -r -p < "$pcapbase.refined" > "$pcapbase.bin"
