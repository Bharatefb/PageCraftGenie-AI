from PIL import Image, ImageDraw, ImageFont
import textwrap


def create_image(title, content, output_path):

    width = 1200
    height = 800

    image = Image.new(
        "RGB",
        (width, height),
        "white"
    )

    draw = ImageDraw.Draw(image)

    try:
        title_font = ImageFont.truetype(
            "arial.ttf",
            48
        )

        body_font = ImageFont.truetype(
            "arial.ttf",
            28
        )

    except:

        title_font = ImageFont.load_default()
        body_font = ImageFont.load_default()

    draw.text(
        (60, 50),
        title,
        fill="black",
        font=title_font
    )

    y = 140

    for item in content:

        text = item

        if isinstance(item, dict):

            text = (
                item.get("heading", "")
                + "\n"
                + item.get("text", "")
            )

        wrapped = textwrap.wrap(
            str(text),
            width=70
        )

        for line in wrapped:

            draw.text(
                (60, y),
                line,
                fill="black",
                font=body_font
            )

            y += 40

        y += 20

    image.save(output_path)

    return output_path
