import comtypes.client
import comtypes
import os

def ppt_to_images(ppt_path, output_dir):
    comtypes.CoInitialize()  # 关键：初始化COM
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
    powerpoint.Visible = 1
    ppt = powerpoint.Presentations.Open(os.path.abspath(ppt_path))
    ppt.SaveAs(os.path.abspath(output_dir), 17)  # 17 = ppSaveAsJPG
    ppt.Close()
    powerpoint.Quit()
# 用法：ppt_to_images("output/xxx.pptx", "output/xxx_images")
