import cellular from "../assets/shared/cellular.svg";
import wifi from "../assets/shared/wifi.svg";
import battery from "../assets/shared/battery.svg";

export default function StatusBar() {
  return (
    <div className="flex w-full flex-col items-start pt-[21px]">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-[1_0_0] items-center justify-center min-w-px pr-[6px] pl-4">
          <p
            className="text-center text-[17px] leading-[22px] font-semibold whitespace-nowrap"
            style={{ color: "#090909" }}
          >
            9:41
          </p>
        </div>
        <div className="h-[10px] w-[124px] shrink-0" />
        <div className="flex flex-[1_0_0] min-w-px items-center justify-center gap-[7px] pr-4 pl-[6px]">
          <img src={cellular} alt="" className="h-[12.226px] w-[19.2px] shrink-0" />
          <img src={wifi} alt="" className="h-[12.328px] w-[17.142px] shrink-0" />
          <img src={battery} alt="" className="h-[13px] w-[27.328px] shrink-0" />
        </div>
      </div>
    </div>
  );
}
