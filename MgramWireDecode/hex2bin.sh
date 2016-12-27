set -xv

# Utility to take wireshark hex-ascii output from a particular customer and to
# reconstruct binary traffic that occurs on and after a particular
# bytes pattern appears
#
# This utility is largely unnecessary.


pattern="3e.1a.19"
dump=dump.txt

# extract options and their arguments into variables.
while true ; do
    case "$1" in
        --pattern|-p)  shift ; pattern=$1 ; shift ;;
        --file|-f)  shift ; dump=$1 ; shift ;;
        --help|-h) echo "Usage:hasc2bin [--pattern pattern] [--hexasciifile file]" ; exit 1 ;;
	*) break ;; 
    esac
done

cat > .awk << END
BEGIN {
file="drop";
}
/^Frame/{file=sprintf("%s%03d", "trace", ++i);next}
/^/{sub("^.","0000&"); sub("   ",": ");print >> file; next}
END

rm trace* drop*

# look for start pattern and crudely chop out preceding traffic
x=`grep -n  $pattern $dump | cut -d: -f 1`
y=`expr $x - 5`
sed -e "1,`echo $y`d" $dump >  tcpdump.trunc


# split the tcpdump into individual tcp messages, preserve the client bound
# traffic in files trace001..trace002 etc. Format the tcpdump entries into
# a form suitable to run xxd,

awk -f .awk tcpdump.trunc


for f in `ls trace*`
do

# reverse the xxd hexdump to binary using xxd
xxd -r < $f > $f.bin1

z=`wc --bytes $f.bin1 | awk '{ print $1 }'`
w=`expr $z - 52`
tail -c $w $f.bin1 > $f.bin11

# chop the TCP header out
dd ibs=1 obs=1 skip=52 if=$f.bin1 of=$f.bin11

# concatenate into one binary file
cat $f.bin11 >> trace.bin
done


# for reference create a single xxd hexdump format of the binary
xxd < trace.bin > trace.hex

